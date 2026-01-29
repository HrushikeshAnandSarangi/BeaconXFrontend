"use client"

import React, { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";

export type AQIMapPoint = {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  aqi: number;
  category: string;
};

type Props = {
  mapCenter: { lat: number; lng: number };
  airQuality: {
    aqi: number;
    location: string;
    coordinates: { lat: number; lng: number };
    category: string;
  } | null;
  mapPoints: AQIMapPoint[];
  selectedPoint: AQIMapPoint | null;
  setSelectedPoint: (point: AQIMapPoint | null) => void;
  getMarkerColor: (aqi: number) => string;
  getAQIColor: (aqi: number) => string;
  onMapReady?: (map: LeafletMap) => void;
  mapContainerStyle: React.CSSProperties;
};

const osmTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const MapReady = ({ onReady }: { onReady?: (map: LeafletMap) => void }) => {
  const map = useMap();

  useEffect(() => {
    onReady?.(map);
  }, [map, onReady]);

  return null;
};

const LeafletAQIMap: React.FC<Props> = ({
  mapCenter,
  airQuality,
  mapPoints,
  selectedPoint,
  setSelectedPoint,
  getMarkerColor,
  getAQIColor,
  onMapReady,
  mapContainerStyle,
}) => {
  return (
    <MapContainer
      style={mapContainerStyle}
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={12}
      scrollWheelZoom={false}
    >
      <MapReady onReady={onMapReady} />
      <TileLayer attribution={osmAttribution} url={osmTileUrl} />
      {airQuality?.coordinates && (
        <CircleMarker
          center={[airQuality.coordinates.lat, airQuality.coordinates.lng]}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: getMarkerColor(airQuality.aqi),
            fillOpacity: 1,
          }}
          eventHandlers={{
            click: () => {
              setSelectedPoint({
                id: "main",
                location: airQuality.location,
                coordinates: airQuality.coordinates,
                aqi: airQuality.aqi,
                category: airQuality.category,
              });
            },
          }}
        />
      )}

      {mapPoints.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.coordinates.lat, point.coordinates.lng]}
          radius={8}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: getMarkerColor(point.aqi),
            fillOpacity: 1,
          }}
          eventHandlers={{
            click: () => setSelectedPoint(point),
          }}
        />
      ))}

      {selectedPoint && (
        <Popup
          position={[selectedPoint.coordinates.lat, selectedPoint.coordinates.lng]}
          eventHandlers={{
            remove: () => setSelectedPoint(null),
          }}
        >
          <div className="p-2 bg-gray-800 text-gray-200">
            <h4 className="font-bold">{selectedPoint.location}</h4>
            <div className={`px-2 py-1 rounded ${getAQIColor(selectedPoint.aqi)}`}>
              AQI: {selectedPoint.aqi} ({selectedPoint.category})
            </div>
          </div>
        </Popup>
      )}
    </MapContainer>
  );
};

export default LeafletAQIMap;
