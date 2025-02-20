import React, { useEffect, useState } from 'react';

interface ActivityPlace {
  name: string;
  address: string;
  rating: number;
}

interface NearbyPlacesProps {
  activity: string;
  onBack: () => void;
  onSelect: (place: string) => void;
}

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({ activity, onBack, onSelect }) => {
  const [nearbyPlaces, setNearbyPlaces] = useState<ActivityPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findNearbyPlaces = async () => {
      setIsLoading(true);
      setError(null); // ✅ Optional, can be removed if unnecessary
  
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
            setNearbyPlaces(places.slice(0, 10));
          } else {
            setError('No nearby places found.');
          }
          setIsLoading(false);
        });
      } catch (err: unknown) { // ✅ Change variable name
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error fetching location.');
        }
        setIsLoading(false);
      }
    };
  
    findNearbyPlaces();
  }, [activity]);

  return (
    <div className="p-6 bg-auto shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-6">Nearby Places for {activity}</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="max-h-72 overflow-y-auto border rounded-lg p-4 bg-gray-50">
        {nearbyPlaces.map((place, index) => (
          <div
            key={index}
            className="p-4 mb-4 rounded-lg shadow cursor-pointer bg-white hover:bg-gray-100"
            onClick={() => onSelect(`${place.name}, ${place.address} (Rating: ${place.rating}/5)`)}
          >
            <h3 className="text-lg font-bold">{place.name}</h3>
            <p className="text-sm text-gray-600">{place.address}</p>
            <p className="text-sm">Rating: {place.rating}/5</p>
          </div>
        ))}
      </div>

      <button onClick={onBack} className="mt-6 bg-gray-500 text-white px-4 py-2 rounded-lg">
        Back
      </button>
    </div>
  );
};