import { useEffect, useRef } from "react";

export default function GoogleMap({ address, city }) {
  const mapRef = useRef(null);
  const fullAddress = `${address}, ${city}, CA`;

  useEffect(() => {
    if (!address || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === "OK" && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: results[0].geometry.location,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        new window.google.maps.Marker({
          map,
          position: results[0].geometry.location,
          title: fullAddress,
        });
      }
    });
  }, [fullAddress]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: 10 }} />;
}
