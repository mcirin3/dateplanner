'use client';

import React, { useState, useEffect } from 'react';

interface ActivityPlace {
  name: string;
  address: string;
  rating: number;
}

const ACTIVITIES = [
  'Bowling', 'Pool', 'Mini Golf', 'Walk', 'Drive', 
  'Movie', 'Concert', 'Art Gallery', 'Hiking', 'Picnic', 'Billiards'
];

interface ActivitySelectorProps {
  onSelect: (activity: string) => void; // Pass selected data to parent
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({ onSelect }) => {
  const [nearbyPlaces, setNearbyPlaces] = useState<ActivityPlace[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null); // Track activity
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDjwR3F1GrzRTdS7QYy3akXbRhnsCX3t_8&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const findNearbyPlaces = async (activity: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const map = new google.maps.Map(document.createElement('div'));
      const service = new google.maps.places.PlacesService(map);

      const request = {
        location: new google.maps.LatLng(latitude, longitude),
        radius: 5000,
        type: 'establishment',
        keyword: activity,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places = results.map((place) => ({
            name: place.name || 'Unknown',
            address: place.vicinity || 'Unknown address',
            rating: place.rating || 0,
          }));
          setNearbyPlaces(places.slice(0, 6));
        } else {
          setError('No nearby places found.');
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError('Error fetching location or places.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity);
    findNearbyPlaces(activity); // Fetch places for the selected activity
  };

  const handlePlaceSelect = (place: ActivityPlace) => {
    const formatted = `${place.name}, ${place.address} (Rating: ${place.rating}/5)`;
    setSelectedActivity(formatted); // Highlight selected activity
    onSelect(formatted); // Pass formatted string to parent
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Choose an Activity</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        {ACTIVITIES.map((activity) => (
          <button
            key={activity}
            onClick={() => handleActivitySelect(activity)}
            className={`p-2 border rounded ${
              selectedActivity === activity ? 'bg-green-500 text-white' : 'hover:bg-green-100'
            }`}
          >
            {activity}
          </button>
        ))}
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearbyPlaces.map((place, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-lg cursor-pointer ${
              selectedActivity === `${place.name}, ${place.address} (Rating: ${place.rating}/5)`
                ? 'bg-green-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handlePlaceSelect(place)}
          >
            <h3 className="text-lg font-bold mb-2">{place.name}</h3>
            <p className="text-sm">{place.address}</p>
            <p className="mt-2">Rating: {place.rating}/5</p>
          </div>
        ))}
      </div>
    </div>
  );
};
