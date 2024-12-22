'use client';

import React, { useState, useEffect } from 'react';

interface DessertSpot {
  name: string;
  address: string;
  rating: number;
}

const DESSERT_CATEGORIES = [
  'Ice Cream', 'Bakery', 'Donuts', 'Frozen Yogurt',
  'Cupcakes', 'Pastries', 'Pies', 'Cookies', 'Chocolates',
  'Gelato', 'Crepes', 'Candy', 'Bubble Tea', 'Milk Tea',
];

interface DessertSpotSelectorProps {
  onSelect: (selection: string) => void; // Pass selected data to parent
}

export const DessertSpotSelector: React.FC<DessertSpotSelectorProps> = ({ onSelect }) => {
  const [nearbyDesserts, setNearbyDesserts] = useState<DessertSpot[]>([]);
  const [selectedDessert, setSelectedDessert] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualSearchTerm, setManualSearchTerm] = useState<string>('');

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCxdZLaoUpwTI7Lkdkiuu-xxTLZrN2Uye8&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const findNearestDesserts = async (category: string) => {
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
        type: 'bakery',
        keyword: category,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const desserts = results.map((place) => ({
            name: place.name || 'Unknown',
            address: place.vicinity || 'Unknown address',
            rating: place.rating || 0,
          }));
          setNearbyDesserts(desserts.slice(0, 6));
        } else {
          setError('No nearby dessert spots found.');
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
    findNearestDesserts(spot);
  };

  const handleManualSearch = () => {
    if (manualSearchTerm.trim() !== '') {
      findNearestDesserts(manualSearchTerm);
    } else {
      setError('Please enter a valid search term.');
    }
  };

  const handleDessertSelect = (dessert: DessertSpot) => {
    const formatted = `${dessert.name}, ${dessert.address} (Rating: ${dessert.rating}/5)`;
    setSelectedDessert(formatted);
    onSelect(formatted);
  };

  const handleNoneSelect = () => {
    setSelectedDessert('None');
    onSelect('None');
  };

  return (
    <div className="p-6 bg-auto shadow rounded-lg max-w-4xl mx-auto overflow-hidden">
      <h2 className="text-2xl font-semibold mb-6">Choose a Dessert Spot</h2>

      {/* Dessert Categories */}
      <div className="flex flex-wrap gap-4 mb-6">
        {DESSERT_CATEGORIES.map((spot) => (
          <button
            key={spot}
            onClick={() => handleSelect(spot)}
            className={`px-4 py-2 rounded-lg text-white ${
              selectedDessert === spot
                ? 'bg-green-500'
                : 'bg-pink-500 hover:bg-pink-600'
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

      {/* Scrollable Dessert List */}
      <div className="max-h-96 overflow-y-auto flex flex-col gap-4">
        {nearbyDesserts.map((dessert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-lg cursor-pointer ${
              selectedDessert === `${dessert.name}, ${dessert.address} (Rating: ${dessert.rating}/5)`
                ? 'bg-green-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleDessertSelect(dessert)}
          >
            <h3 className="text-lg font-semibold">{dessert.name}</h3>
            <p className="text-sm text-gray-600">{dessert.address}</p>
            <p className="mt-2 text-sm">Rating: {dessert.rating}/5</p>
          </div>
        ))}
      </div>

      {/* None Option */}
      <button
        onClick={handleNoneSelect}
        className={`mt-6 w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 ${
          selectedDessert === 'None' ? 'bg-gray-700' : ''
        }`}
      >
        None
      </button>
    </div>
  );
};
