import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

export default async function handler(req, res) {
  const { latitude, longitude, cuisine } = req.query;

  if (!latitude || !longitude || !cuisine) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    const response = await client.placesNearby({
      params: {
        location: `${latitude},${longitude}`,
        radius: 5000, // Adjust search radius (in meters) as needed
        type: "restaurant",
        keyword: cuisine,
        key: process.env.GOOGLE_MAPS_API_KEY, // Use your environment variable here
      },
    });

    const restaurants = response.data.results.map((place) => ({
      name: place.name,
      address: place.vicinity,
      rating: place.rating || 0,
      distance: place.geometry ? calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng) : 0,
    }));

    res.status(200).json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
}

// Utility function to calculate distance between two lat/lng pairs
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

