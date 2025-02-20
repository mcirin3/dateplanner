import React, { useState, useEffect } from 'react';
import {loadGoogleMaps} from '../utils/loadGoogleMaps';

interface ActivitySelectionProps {
  onSelect: (activity: string) => void;
}

interface ActivitySpot {
  name: string;
  address: string;
  rating: number;
}

const DEFAULT_ACTIVITIES = [
  'Bowling', 'Pool', 'Mini Golf', 'Walk', 'Drive',
  'Movie', 'Concert', 'Art Gallery', 'Hiking', 'Picnic', 'Billiards', 'Shopping'
];

export const ActivitySelector: React.FC<ActivitySelectionProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState<ActivitySpot[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customActivities, setCustomActivities] = useState<string[]>([]);

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const findNearestPlace = async (category: string) => {
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
        keyword: category,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const activitySpots = results.map((place) => ({
            name: place.name || 'Unknown',
            address: place.vicinity || 'Unknown address',
            rating: place.rating || 0,
          }));
          setNearbyPlaces(activitySpots.slice(0, 6));
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

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      const newActivity = searchTerm.trim();
      setCustomActivities((prev) => Array.from(new Set([...prev, newActivity])));
      setSelectedActivity(newActivity);
      onSelect(newActivity);
    }
  };

  const handleSelect = (activity: string) => {
    setSelectedActivity(activity);
    onSelect(activity);
    findNearestPlace(activity);
  };

  const handleNoneSelect = () => {
    setSelectedActivity('None');
    onSelect('None');
  };

  return (
    <div className="p-6 bg-auto shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Choose an Activity</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        {[...DEFAULT_ACTIVITIES, ...customActivities].map((activity) => (
          <button
            key={activity}
            onClick={() => handleSelect(activity)}
            className={`p-2 border rounded hover:bg-green-100 ${
              selectedActivity === activity ? 'bg-green-500 text-white' : ''
            }`}
          >
            {activity}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for an activity..."
          className="border px-4 py-2 rounded-lg w-full"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Search
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Scrollable Nearby Places List */}
      <div className="max-h-96 overflow-y-auto flex flex-wrap gap-6">
        {nearbyPlaces.map((spot, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-between p-4 w-64 h-32 rounded-lg shadow-lg cursor-pointer overflow-hidden ${
              selectedActivity === spot.name ? 'bg-green-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleSelect(spot.name)}
          >
            <h3 className="text-lg font-semibold text-center overflow-ellipsis whitespace-nowrap">{spot.name}</h3>
            <p className="text-sm text-center overflow-ellipsis whitespace-nowrap">{spot.address}</p>
            <p className="mt-2 text-sm text-center">Rating: {spot.rating}/5</p>
          </div>
        ))}
      </div>

      {/* None Option */}
      <button
        onClick={handleNoneSelect}
        className={`mt-6 w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 ${
          selectedActivity === 'None' ? 'bg-gray-700' : ''
        }`}
      >
        None
      </button>
    </div>
  );
};