"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import airportInfo from "../data/airportInfo.mjs";
import airportStatus from "../data/airportStatus.json";

// Same controlled flag we use in the page
function isControlledAirport(icao) {
  const info = airportInfo[icao];
  return info && info.isControlled === true;
}

// Get NOTAM status for an airport
function getNotamStatus(icao) {
  return airportStatus[icao] || null;
}

// Get color based on NOTAM status
function getStatusColor(status, controlled) {
  if (!status) {
    // Fallback to controlled/uncontrolled colors
    return controlled ? "#22c55e" : "#f97316";
  }
  
  switch (status.status) {
    case "CLOSED":
      return "#ef4444"; // Red
    case "LIMITED":
      return "#eab308"; // Yellow
    case "OPERATIONAL":
      return "#22c55e"; // Green
    default:
      return controlled ? "#22c55e" : "#f97316";
  }
}

// Get CSS class name for animation based on status
function getStatusClassName(status) {
  if (!status) return "";
  
  switch (status.status) {
    case "CLOSED":
      return "pulse-red";
    case "LIMITED":
      return "pulse-yellow";
    default:
      return "";
  }
}

// Get emoji for status
function getStatusEmoji(status) {
  if (!status) return "";
  
  switch (status) {
    case "CLOSED":
      return "❌ ";
    case "LIMITED":
      return "⚠️ ";
    case "OPERATIONAL":
      return "✅ ";
    default:
      return "";
  }
}

// Define Colombia bounds to prevent panning too far (used by MapContainer)
const colombiaBounds = [
  [-4.5, -79.5], // Southwest corner
  [13.5, -66.5]  // Northeast corner
];

export default function AirportsMap({
  airports,
  selectedIcao,
  onSelectIcao,
}) {
  const [isReady, setIsReady] = useState(false);
  const styleElementRef = React.useRef(null);

  // Avoid hydration glitches
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Inject CSS animations for pulsing markers
  useEffect(() => {
    const styleId = "airport-pulse-animations";
    
    // Check if style already exists
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      // Style already exists, just register cleanup for this instance
      return () => {
        // Don't remove on cleanup if it already existed
      };
    }
    
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes pulse-red {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.6;
          transform: scale(1.15);
        }
      }
      
      @keyframes pulse-yellow {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
        }
      }
      
      .pulse-red {
        animation: pulse-red 1.5s ease-in-out infinite;
      }
      
      .pulse-yellow {
        animation: pulse-yellow 2s ease-in-out infinite;
      }
    `;
    
    document.head.appendChild(style);
    styleElementRef.current = style;
    
    // Cleanup function - remove the style element we added
    return () => {
      if (styleElementRef.current && styleElementRef.current.parentNode) {
        styleElementRef.current.parentNode.removeChild(styleElementRef.current);
        styleElementRef.current = null;
      }
    };
  }, []);

  const airportsWithCoords = useMemo(() => {
    return airports
      .map((a) => {
        const info = airportInfo[a.icao];
        if (
          !info ||
          typeof info.lat !== "number" ||
          typeof info.lon !== "number"
        ) {
          return null;
        }
        const notamStatus = getNotamStatus(a.icao);
        // Pre-format the date to avoid creating new Date objects during render
        const notamStatusWithDate = notamStatus ? {
          ...notamStatus,
          formattedDate: notamStatus.lastUpdated 
            ? new Date(notamStatus.lastUpdated).toLocaleString()
            : null
        } : null;
        
        return {
          icao: a.icao,
          lat: info.lat,
          lon: info.lon,
          controlled: isControlledAirport(a.icao),
          name: info.name,
          city: info.city,
          notamStatus: notamStatusWithDate,
        };
      })
      .filter(Boolean);
  }, [airports]);

  if (!isReady) return null;

  // Rough center of Colombia
  const center = [4.5, -73.0];
  const zoom = 5.5;

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
            color: getStatusColor(a.notamStatus, a.controlled),
            fillOpacity: 0.9,
          }}
          className={getStatusClassName(a.notamStatus)}
          eventHandlers={{
            click: () => onSelectIcao && onSelectIcao(a.icao),
          }}
        >
          <Popup>
            <div className="text-xs">
              <div className="font-semibold">{a.icao}</div>
              {a.city && <div>{a.city}</div>}
              {a.name && <div>{a.name}</div>}
              
              {a.notamStatus ? (
                <div className="mt-2 space-y-1">
                  <div>
                    <span
                      className={
                        "inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold " +
                        (a.notamStatus.status === "CLOSED"
                          ? "bg-red-100 text-red-700"
                          : a.notamStatus.status === "LIMITED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700")
                      }
                    >
                      {getStatusEmoji(a.notamStatus.status)}
                      {a.notamStatus.status}
                    </span>
                  </div>
                  {a.notamStatus.reason && (
                    <div className="text-[10px] text-gray-600">
                      {a.notamStatus.reason}
                    </div>
                  )}
                  {a.notamStatus.formattedDate && (
                    <div className="text-[9px] text-gray-400">
                      Updated: {a.notamStatus.formattedDate}
                    </div>
                  )}
                </div>
              ) : (
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
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
