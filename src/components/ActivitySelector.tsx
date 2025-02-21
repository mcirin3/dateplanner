'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';

interface ActivitySpot {
  name: string;
  address: string;
  rating: number;
}

const ACTIVITY_CATEGORIES = [
  'Bowling', 'Pool', 'Mini Golf', 'Walk', 'Drive',
  'Movie', 'Concert', 'Art Gallery', 'Hiking', 'Picnic', 'Billiards', 'Shopping','Study','Gym','Groceries','Library'
];

interface ActivitySpotSelectorProps {
  onSelect: (selection: string) => void;
}

export const ActivitySelector: React.FC<ActivitySpotSelectorProps> = ({ onSelect }) => {
  const [nearbyActivitySpots, setNearbyActivitySpots] = useState<ActivitySpot[]>([]);
  const [selectedActivitySpot, setSelectedActivitySpot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState<string>('');
  const [useLocation, setUseLocation] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null); // Allow null
  const [activitySearch, setActivitySearch] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      await loadGoogleMaps();

      if (window.google && window.google.maps && inputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            setLocationInput(place.formatted_address || '');
          }
        });
      }
    };

    loadGoogleMapsAPI();
  }, []);

  const findNearestActivitySpots = async (category: string, lat?: number, lng?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      let latitude = lat;
      let longitude = lng;

      if (!latitude || !longitude) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const map = new google.maps.Map(document.createElement('div'));
      const service = new google.maps.places.PlacesService(map);

      const request = {
        location: new google.maps.LatLng(latitude, longitude),
        radius: 5000,
        type: 'establishment',
        keyword: category,
      };

      service.nearbySearch(request, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
          setError('No nearby activity spots found.');
          setIsLoading(false);
          return;
        }

        const activitySpots = results.map((place) => ({
          name: place.name || 'Unknown',
          address: place.vicinity || 'Unknown address',
          rating: place.rating || 0,
        }));

        setNearbyActivitySpots(activitySpots);
        setIsLoading(false);
      });
    } catch (err) {
      setError('Error fetching location or places.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const geocodeLocation = async () => {
    if (!locationInput.trim()) {
      setError('Please enter a valid location.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: locationInput }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]?.geometry?.location) {
          const { lat, lng } = results[0].geometry.location;
          findNearestActivitySpots(selectedActivity || 'establishment', lat(), lng());
        } else {
          setError('Invalid location. Please enter a valid city or address.');
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError('Failed to get location coordinates.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const searchActivity = async () => {
    if (!activitySearch.trim()) {
      setError('Please enter a valid activity name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const map = new google.maps.Map(document.createElement('div'));
      const service = new google.maps.places.PlacesService(map);

      const request = {
        query: activitySearch,
        fields: ['name', 'geometry', 'formatted_address', 'rating'],
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
          const activitySpot = results[0];
          const activity = {
            name: activitySpot.name || 'Unknown',
            address: activitySpot.formatted_address || 'Unknown address',
            rating: activitySpot.rating || 0,
          };

          setNearbyActivitySpots([activity]);
          setIsLoading(false);
        } else {
          setError('Activity not found.');
          setIsLoading(false);
        }
      });
    } catch (err) {
      setError('Error searching for activity.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleSelectActivity = (activity: ActivitySpot) => {
    const formatted = `${activity.name}, ${activity.address} (Rating: ${activity.rating}/5)`;
    setSelectedActivitySpot(formatted);
    onSelect(formatted);
  };

  const handleActivityClick = (activity: string) => {
    // If the activity is already selected, unselect it; otherwise, set it
    if (selectedActivity === activity) {
      setSelectedActivity(null);
    } else {
      setSelectedActivity(activity);
    }
  };

  const handleSearch = () => {
    if (!locationInput.trim() && !useLocation) {
      setError('Please enter a valid location or select "Use My Location".');
      return;
    }
  
    if (!selectedActivity && !activitySearch.trim()) {
      setError('Please select an activity or enter an activity name.');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    let category = selectedActivity || activitySearch.trim(); // Use selected category or search term
  
    if (!category) {
      category = 'study';  // Default to 'study' if neither is selected
    }
  
    if (activitySearch.trim()) {
      searchActivity();
    } else if (useLocation) {
      findNearestActivitySpots(category);
    } else if (locationInput.trim()) {
      geocodeLocation();
    }
  };
  
  
  
  return (
    <div className="p-6 bg-auto shadow rounded-lg max-w-4xl mx-auto overflow-hidden">
      <h2 className="text-2xl font-semibold mb-6">Find Nearby Activity Spots</h2>

      {/* Location Input with Suggestions */}
      <div className="flex items-center gap-2 mb-6">
        <input
          ref={inputRef}
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Enter a place or address..."
          className="border px-4 py-2 rounded-lg w-full"
        />
      </div>

      {/* Activity Search */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={activitySearch}
          onChange={(e) => setActivitySearch(e.target.value)}
          placeholder="Search for an activity..."
          className="border px-4 py-2 rounded-lg w-full"
        />
      </div>

      {/* Activity Selector */}
      <div className="flex flex-wrap gap-4 mb-6">
        {ACTIVITY_CATEGORIES.map((activity) => (
          <button
            key={activity}
            onClick={() => handleActivityClick(activity)}
            className={`px-4 py-2 rounded-lg text-white ${
              selectedActivity === activity
                ? 'bg-green-500'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {activity}
          </button>
        ))}
      </div>

      {/* Use My Location Checkbox */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={useLocation}
          onChange={() => setUseLocation(!useLocation)}
        />
        <label>Use my current location</label>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Search Activity Spots
      </button>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Activity Spot Results */}
      <div className="max-h-96 overflow-y-auto flex flex-wrap gap-6 mt-6">
        {nearbyActivitySpots.map((activitySpot, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-between p-4 w-64 h-32 rounded-lg shadow-lg cursor-pointer overflow-hidden ${
              selectedActivitySpot === `${activitySpot.name}, ${activitySpot.address} (Rating: ${activitySpot.rating}/5)`
                ? 'bg-green-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleSelectActivity(activitySpot)}
          >
            <h3 className="text-lg font-semibold text-center">{activitySpot.name}</h3>
            <p className="text-sm text-center">{activitySpot.address}</p>
            <p className="mt-2 text-sm text-center">Rating: {activitySpot.rating}/5</p>
          </div>
        ))}
      </div>
    </div>
  );
};