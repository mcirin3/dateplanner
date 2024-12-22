import React, { useState, useEffect } from 'react';

interface Restaurant {
  name: string;
  address: string;
  rating: number;
}

const FOOD_CATEGORIES = [
  'Dim Sum', 'Tacos', 'Curry', 'Filipino',
  'Burgers', 'Spaghetti', 'Sushi', 'Ramen', 'Korean BBQ',
  'Thai', 'Mediterranean', 'Fast Food', 'Dan Dan Noodles',
  'Pho', 'Udon', 'Dumplings', 'Korean Fried Chicken',
  'Chipotle', 'Pizza', 'South African', 'Indian' 
];

interface FoodSpotSelectorProps {
  onSelect: (selection: string) => void;
}

export const FoodSpotSelector: React.FC<FoodSpotSelectorProps> = ({ onSelect }) => {
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualSearchTerm, setManualSearchTerm] = useState<string>(''); // State for manual input

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCxdZLaoUpwTI7Lkdkiuu-xxTLZrN2Uye8&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const findNearestRestaurants = async (query: string) => {
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
        radius: 15000,
        type: 'restaurant',
        keyword: query,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const restaurants = results.map((place) => ({
            name: place.name || 'Unknown',
            address: place.vicinity || 'Unknown address',
            rating: place.rating || 0,
          }));
          setNearbyRestaurants(restaurants.slice(0, 6));
        } else {
          setError('No nearby restaurants found.');
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
    findNearestRestaurants(spot);
  };

  const handleManualSearch = () => {
    if (manualSearchTerm.trim() !== '') {
      findNearestRestaurants(manualSearchTerm);
    } else {
      setError('Please enter a valid search term.');
    }
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    const formatted = `${restaurant.name}, ${restaurant.address} (Rating: ${restaurant.rating}/5)`;
    setSelectedRestaurant(formatted);
    onSelect(formatted);
  };

  const handleNoneSelect = () => {
    setSelectedRestaurant('None');
    onSelect('None');
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Choose a Food Spot</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        {FOOD_CATEGORIES.map((spot) => (
          <button
            key={spot}
            onClick={() => handleSelect(spot)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            {spot}
          </button>
        ))}
      </div>

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

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearbyRestaurants.map((restaurant, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-lg cursor-pointer ${
              selectedRestaurant === `${restaurant.name}, ${restaurant.address} (Rating: ${restaurant.rating}/5)`
                ? 'bg-green-500 text-white'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleRestaurantSelect(restaurant)}
          >
            <h3 className="text-lg font-bold mb-2">{restaurant.name}</h3>
            <p className="text-sm">{restaurant.address}</p>
            <p className="mt-2">Rating: {restaurant.rating}/5</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleNoneSelect}
        className={`mt-6 w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 ${
          selectedRestaurant === 'None' ? 'bg-gray-700' : ''
        }`}
      >
        None
      </button>
    </div>
  );
};