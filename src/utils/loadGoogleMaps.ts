declare global {
  interface Window {
    google?: typeof google;
    googleMapsLoaded?: boolean; // Custom flag to track loading
  }
}

export const loadGoogleMaps = (): void => {
  if (window.google?.maps || window.googleMapsLoaded) return; // Prevent multiple loads

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('Google Maps API key is missing.');
    return;
  }

  // Check if the script tag already exists
  if (document.querySelector('script[src*="maps.googleapis.com"]')) {
    console.log('Google Maps API script already exists.');
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.onload = () => {
    console.log('Google Maps API loaded.');
    window.googleMapsLoaded = true; // Set flag to prevent duplicate loading
  };
  
  document.head.appendChild(script);
};