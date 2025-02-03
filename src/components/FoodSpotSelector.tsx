'use client';

import React, { useState, useEffect } from 'react';

interface FoodSpot {
  name: string;
  address: string;
  rating: number;
}

const FOOD_CATEGORIES = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'French', 'American', 'Mediterranean',
  'Korean', 'Thai', 'Vietnamese', 'Greek', 'Spanish', 'Turkish', 'Caribbean',
];

interface FoodSpotSelectorProps {
  onSelect: (selection: string) => void; // Pass selected data to parent
}

export const FoodSpotSelector: React.FC<FoodSpotSelectorProps> = ({ onSelect }) => {
  const [nearbyFoodSpots, setNearbyFoodSpots] = useState<FoodSpot[]>([]);
  const [selectedFoodSpot, setSelectedFoodSpot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualSearchTerm, setManualSearchTerm] = useState<string>('');

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBgcdvdX8pc73jXaPy2YU04tUQ-eIsTWBA&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const findNearestFoodSpots = async (category: string) => {
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
        type: 'restaurant',
        keyword: category,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const foodSpots = results.map((place) => ({
            name: place.name || 'Unknown',
            address: place.vicinity || 'Unknown address',
            rating: place.rating || 0,
          }));
          setNearbyFoodSpots(foodSpots.slice(0, 6));
        } else {
          setError('No nearby food spots found.');
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError('Error fetching location or places.');
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleSelect = (spot: string) => {
    findNearestFoodSpots(spot);
  };

  const handleManualSearch = () => {
    if (manualSearchTerm.trim() !== '') {
      findNearestFoodSpots(manualSearchTerm);
    } else {
      setError('Please enter a valid search term.');
    }
  };

  const handleFoodSelect = (foodSpot: FoodSpot) => {
    const formatted = `${foodSpot.name}, ${foodSpot.address} (Rating: ${foodSpot.rating}/5)`;
    setSelectedFoodSpot(formatted);
    onSelect(formatted);
  };

  const handleNoneSelect = () => {
    setSelectedFoodSpot('None');
    onSelect('None');
  };

  return (
    <div className="p-6 bg-auto shadow rounded-lg max-w-4xl mx-auto overflow-hidden">
      <h2 className="text-2xl font-semibold mb-6">Choose a Food Spot</h2>

      {/* Food Categories */}
      <div className="flex flex-wrap gap-4 mb-6">
        {FOOD_CATEGORIES.map((spot) => (
          <button
            key={spot}
            onClick={() => handleSelect(spot)}
            className={`px-4 py-2 rounded-lg text-white ${
              selectedFoodSpot === spot
                ? 'bg-green-500'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {spot}
          </button>
        ))}
      </div>

      {/* Manual Search */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={manualSearchTerm}
          onChange={(e) => setManualSearchTerm(e.target.value)}
          placeholder="Search for a place..."
          className="border px-4 py-2 rounded-lg w-full"
        />
        <button
          onClick={handleManualSearch}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Search
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Scrollable Food List with Horizontal Rectangular Cards */}
      <div className="max-h-96 overflow-y-auto flex flex-wrap gap-6">
        {nearbyFoodSpots.map((foodSpot, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-between p-4 w-64 h-32 rounded-lg shadow-lg cursor-pointer overflow-hidden ${
              selectedFoodSpot === `${foodSpot.name}, ${foodSpot.address} (Rating: ${foodSpot.rating}/5)`
                ? 'bg-green-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleFoodSelect(foodSpot)}
          >
            <h3 className="text-lg font-semibold text-center overflow-ellipsis whitespace-nowrap text-ellipsis">{foodSpot.name}</h3>
            <p className="text-sm text-center overflow-ellipsis whitespace-nowrap text-ellipsis">{foodSpot.address}</p>
            <p className="mt-2 text-sm text-center">Rating: {foodSpot.rating}/5</p>
          </div>
        ))}
      </div>

      {/* None Option */}
      <button
        onClick={handleNoneSelect}
        className={`mt-6 w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 ${
          selectedFoodSpot === 'None' ? 'bg-gray-700' : ''
        }`}
      >
        None
      </button>
    </div>
  );
};