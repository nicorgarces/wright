import { useState, useEffect } from "react";

export function useAirportData(icao) {
  const [airport, setAirport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAirport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/airports/${icao}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Airport not found");
        } else {
          throw new Error(`Failed to fetch airport data: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      const airportData = data.airport;

      setAirport(airportData);
    } catch (err) {
      console.error("Error loading airport:", err);
      setError("Failed to load airport information");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAirport();
  }, [icao]);

  return { airport, isLoading, error, reload: loadAirport };
}
