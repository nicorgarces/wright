"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import airportInfo from "../data/airportInfo.mjs";

// Same controlled flag we use in the page
function isControlledAirport(icao) {
  const info = airportInfo[icao];
  return info && info.isControlled === true;
}

export default function AirportsMap({
  airports,
  selectedIcao,
  onSelectIcao,
}) {
  const [isReady, setIsReady] = useState(false);

  // Avoid hydration glitches
  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  // Rough center of Colombia
  const center = [4.5, -73.0];
  const zoom = 5.5;

  const airportsWithCoords = airports
    .map((a) => {
      const info = airportInfo[a.icao];
      if (
        !info ||
        typeof info.lat !== "number" ||
        typeof info.lon !== "number"
      ) {
        return null;
      }
      return {
        icao: a.icao,
        lat: info.lat,
        lon: info.lon,
        controlled: isControlledAirport(a.icao),
        name: info.name,
        city: info.city,
      };
    })
    .filter(Boolean);

  return (
    <MapContainer
      key="colombia-default"       // force consistent initial view
      center={center}
      zoom={zoom}
      minZoom={5.5}
      maxBounds={colombiaBounds}
      maxBoundsViscosity={1.0}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        // In production you’ll probably use your own provider
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {airportsWithCoords.map((a) => (
        <CircleMarker
          key={a.icao}
          center={[a.lat, a.lon]}
          radius={selectedIcao === a.icao ? 7 : 5}
          pathOptions={{
            color: a.controlled ? "#22c55e" : "#f97316", // green vs orange
            fillOpacity: 0.9,
          }}
          eventHandlers={{
            click: () => onSelectIcao && onSelectIcao(a.icao),
          }}
        >
          <Popup>
            <div className="text-xs">
              <div className="font-semibold">{a.icao}</div>
              {a.city && <div>{a.city}</div>}
              {a.name && <div>{a.name}</div>}
              <div className="mt-1">
                <span
                  className={
                    "inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold " +
                    (a.controlled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-orange-100 text-orange-700")
                  }
                >
                  {a.controlled ? "Controlled" : "Uncontrolled"}
                </span>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
