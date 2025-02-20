let isScriptLoaded = false;

export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isScriptLoaded) {
      resolve();
      return;
    }

    // If Google Maps is already available, resolve immediately
    if (typeof window.google !== "undefined") {
      isScriptLoaded = true;
      resolve();
      return;
    }

    const script: HTMLScriptElement = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Google Maps script failed to load"));
    };

    document.head.appendChild(script);
  });
}