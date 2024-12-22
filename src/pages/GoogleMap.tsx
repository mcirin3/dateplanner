import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

interface MapProps {
  latitude: number;
  longitude: number;
  category: string;
}

const GoogleMap: React.FC<MapProps> = ({ latitude, longitude, category }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
    });

    const service = new google.maps.places.PlacesService(map);

    const request: google.maps.places.PlaceSearchRequest = {
      location: { lat: latitude, lng: longitude },
      radius: 5000, // 5 km radius
      keyword: category, // E.g., "Indian", "Chinese", etc.
      type: "restaurant",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        results.forEach((place) => {
          if (place.geometry?.location) {
            new google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
            });
          }
        });
      } else {
        console.error("Failed to fetch places:", status);
      }
    });
  }, [latitude, longitude, category]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCxdZLaoUpwTI7Lkdkiuu-xxTLZrN2Uye8&libraries=places`}
        onLoad={() => console.log("Google Maps script loaded!")}
      />
      <div
        ref={mapRef}
        style={{ width: "100%", height: "400px" }}
      />
    </>
  );
};

export default GoogleMap;
