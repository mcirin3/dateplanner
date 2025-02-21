'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../utils/loadGoogleMaps';

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
  const [locationInput, setLocationInput] = useState<string>('');
  const [useLocation, setUseLocation] = useState<boolean>(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [manualSearchTerm, setManualSearchTerm] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const findNearestDesserts = async (category: string, lat?: number, lng?: number) => {
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
  
      // Allow broader categories if the keyword is set
      const request = {
        location: new google.maps.LatLng(latitude, longitude),
        radius: 10000,
        type: 'bakery',  // You can modify this to broader categories like 'dessert'
        keyword: category,  // Keyword to narrow down but don't limit the results strictly to one
      };
  
      service.nearbySearch(request, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
          setError('No nearby dessert spots found.');
          setIsLoading(false);
          return;
        }
  
        const desserts = (results || []).map((place) => ({
          name: place.name || 'Unknown',
          address: place.vicinity || 'Unknown address',
          rating: place.rating || 0,
        }));
  
        setNearbyDesserts(desserts);
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
          findNearestDesserts(selectedCuisine || 'bakery', lat(), lng());
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

  const searchDessert = async () => {
    if (!manualSearchTerm.trim()) {
      setError('Please enter a valid dessert name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const map = new google.maps.Map(document.createElement('div'));
      const service = new google.maps.places.PlacesService(map);

      const request = {
        query: manualSearchTerm,
        fields: ['name', 'geometry', 'formatted_address', 'rating'],
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
          const dessertSpot = results[0];
          const dessert = {
            name: dessertSpot.name || 'Unknown',
            address: dessertSpot.formatted_address || 'Unknown address',
            rating: dessertSpot.rating || 0,
          };

          setNearbyDesserts([dessert]);
          setIsLoading(false);
        } else {
          setError('Dessert not found.');
          setIsLoading(false);
        }
      });
    } catch (err) {
      setError('Error searching for dessert.');
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
    // Validate the required fields before searching
    if (!locationInput.trim() && !useLocation && !selectedCuisine) {
      setError('Please enter a valid location, select "Use My Location", or choose a dessert category.');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    // Determine the search type: place input, location, or category
    if (manualSearchTerm.trim()) {
      // If there's a manual search term, perform dessert search
      searchDessert();
    } else if (useLocation || locationInput.trim()) {
      // If "Use My Location" is selected or there's a location input, find nearby desserts
      if (useLocation) {
        findNearestDesserts(selectedCuisine || 'bakery');
      } else {
        geocodeLocation();
      }
    } else if (selectedCuisine) {
      // If a category is selected, search for desserts in that category
      findNearestDesserts(selectedCuisine);
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

      {/* Dessert Search */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={manualSearchTerm}
          onChange={(e) => setManualSearchTerm(e.target.value)}
          placeholder="Search for a dessert..."
          className="border px-4 py-2 rounded-lg w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
        >
          Search
        </button>
      </div>

      {/* Dessert Categories */}
      <div className="flex flex-wrap gap-4 mb-6">
        {DESSERT_CATEGORIES.map((dessert) => (
          <button
            key={dessert}
            onClick={() => handleSelectCuisine(dessert)}
            className={`px-4 py-2 rounded-lg text-white ${
              selectedCuisine === dessert
                ? 'bg-green-500'
                : 'bg-pink-500 hover:bg-pink-600'
            }`}
          >
            {dessert}
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

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Scrollable Dessert List */}
      <div className="max-h-96 overflow-y-auto flex flex-col gap-4 mt-6">
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
          selectedDessert === 'None' ? 'bg-green-500' : ''
        }`}
      >
        None
      </button>
    </div>
  );
};