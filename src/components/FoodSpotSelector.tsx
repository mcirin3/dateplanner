'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';

interface FoodSpot {
  name: string;
  address: string;
  rating: number;
}

const FOOD_CATEGORIES = [
  'Mexican', 'American', 'Italian', 'Chinese', 'Indian', 'Japanese', 'Mediterranean', 'Korean',
  'Thai', 'French', 'Vietnamese', 'Spanish', 'Turkish', 'Caribbean',
];

interface FoodSpotSelectorProps {
  onSelect: (selection: string) => void;
}

export const FoodSpotSelector: React.FC<FoodSpotSelectorProps> = ({ onSelect }) => {
  const [nearbyFoodSpots, setNearbyFoodSpots] = useState<FoodSpot[]>([]);
  const [selectedFoodSpot, setSelectedFoodSpot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState<string>('');
  const [useLocation, setUseLocation] = useState<boolean>(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [restaurantSearch, setRestaurantSearch] = useState<string>('');
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

  const findNearestFoodSpots = async (category: string, lat?: number, lng?: number) => {
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
        type: 'restaurant',
        keyword: category,
      };

      service.nearbySearch(request, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
          setError('No nearby food spots found.');
          setIsLoading(false);
          return;
        }

        const foodSpots = (results || []).map((place) => ({
          name: place.name || 'Unknown',
          address: place.vicinity || 'Unknown address',
          rating: place.rating || 0,
        }));

        setNearbyFoodSpots(foodSpots);
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
          findNearestFoodSpots(selectedCuisine || 'restaurant', lat(), lng());
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

  const searchRestaurant = async () => {
    if (!restaurantSearch.trim()) {
      setError('Please enter a valid restaurant name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const map = new google.maps.Map(document.createElement('div'));
      const service = new google.maps.places.PlacesService(map);

      const request = {
        query: restaurantSearch,
        fields: ['name', 'geometry', 'formatted_address', 'rating'],
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
          const foodSpot = results[0];
          const restaurant = {
            name: foodSpot.name || 'Unknown',
            address: foodSpot.formatted_address || 'Unknown address',
            rating: foodSpot.rating || 0,
          };

          setNearbyFoodSpots([restaurant]);
          setIsLoading(false);
        } else {
          setError('Restaurant not found.');
          setIsLoading(false);
        }
      });
    } catch (err) {
      setError('Error searching for restaurant.');
      setIsLoading(false);
      console.error(err);
    }
  };
  

  const handleSelectCuisine = (cuisine: string) => {
    if (selectedCuisine === cuisine) {
      setSelectedCuisine(''); // Unselect if it's already selected
    } else {
      setSelectedCuisine(cuisine); // Select the new cuisine
    }
  };

  const handleSearch = () => {
    if (!locationInput.trim() && !useLocation) {
      setError('Please enter a valid location or select "Use My Location".');
      return;
    }
  
    if (!selectedCuisine && !restaurantSearch.trim()) {
      setError('Please select a cuisine or enter a restaurant name.');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    if (restaurantSearch.trim()) {
      searchRestaurant();
    } else if (useLocation) {
      findNearestFoodSpots(selectedCuisine || 'restaurant');
    } else if (locationInput.trim()) {
      geocodeLocation();
    }
  };

  const handleFoodSelect = (foodSpot: FoodSpot) => {
    const formatted = `${foodSpot.name}, ${foodSpot.address} (Rating: ${foodSpot.rating}/5)`;
    setSelectedFoodSpot(formatted);
    onSelect(formatted);
  };

  return (
    <div className="p-6 bg-auto shadow rounded-lg max-w-4xl mx-auto overflow-hidden">
      <h2 className="text-2xl font-semibold mb-6">Find Nearby Food Spots</h2>

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

      {/* Restaurant Search */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={restaurantSearch}
          onChange={(e) => setRestaurantSearch(e.target.value)}
          placeholder="Search for a restaurant..."
          className="border px-4 py-2 rounded-lg w-full"
        />
      </div>

     {/* Cuisine Selector */}
      <div className="flex flex-wrap gap-4 mb-6">
        {FOOD_CATEGORIES.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => handleSelectCuisine(cuisine)}
            className={`px-4 py-2 rounded-lg text-white ${
              selectedCuisine === cuisine
                ? 'bg-green-500'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {cuisine}
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
        Search Food Spots
      </button>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Scrollable Dessert List */}
      <div className="max-h-96 overflow-y-auto flex flex-col gap-4 mt-6">
        {nearbyFoodSpots.map((foodSpot, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-lg cursor-pointer ${
              selectedFoodSpot === `${foodSpot.name}, ${foodSpot.address} (Rating: ${foodSpot.rating}/5)`
                ? 'bg-green-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleFoodSelect(foodSpot)}
          >
            <h3 className="text-lg font-semibold">{foodSpot.name}</h3>
            <p className="text-sm text-gray-600">{foodSpot.address}</p>
            <p className="mt-2 text-sm">Rating: {foodSpot.rating}/5</p>
          </div>
        ))}
      </div>
    </div>
  );
};