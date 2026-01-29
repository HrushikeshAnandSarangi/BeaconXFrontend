"use client"

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

type Props = {
  center?: { lat: number; lng: number };
  markers?: { lat: number; lng: number }[];
  mapTypeId?: "roadmap" | "satellite" | "hybrid" | "terrain";
  zoom?: number;
  showOpenSpaces?: boolean;
  showShelterPoints?: boolean;
  predictedPath?: { lat: number; lon: number }[];
};

type OverpassElement = {
  lat: number;
  lon: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    [key: string]: string | undefined;
  };
};

type ShelterPoint = {
  lat: number;
  lng: number;
  name: string;
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629, // India default
};

const mapTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const mapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RecenterMap = ({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, map, zoom]);

  return null;
};

const LeafletMapBox: React.FC<Props> = ({
  center = defaultCenter,
  markers = [],
  mapTypeId: _mapTypeId = "roadmap",
  zoom = 5,
  showOpenSpaces = false,
  showShelterPoints = false,
  predictedPath = [],
}) => {
  const [openSpaces, setOpenSpaces] = useState<{ lat: number; lng: number }[]>([]);
  const [shelterPoints, setShelterPoints] = useState<ShelterPoint[]>([]);

  useEffect(() => {
    const fetchOpenSpaces = async (lat: number, lon: number) => {
      const overpassQuery = `
        [out:json];
        (
          node["leisure"="park"](around:3000, ${lat}, ${lon});
          node["leisure"="common"](around:3000, ${lat}, ${lon});
          node["landuse"="grass"](around:3000, ${lat}, ${lon});
          node["leisure"="recreation_ground"](around:3000, ${lat}, ${lon});
        );
        out body;
      `;

      try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: overpassQuery,
        });

        const data = await response.json();

        const markers = data.elements.map((el: OverpassElement) => ({
          lat: el.lat,
          lng: el.lon,
        }));

        setOpenSpaces(markers);
      } catch (error) {
        console.error("Error fetching open spaces from OSM:", error);
      }
    };

    if (center && showOpenSpaces) {
      fetchOpenSpaces(center.lat, center.lng);
    }
  }, [center, showOpenSpaces]);

  useEffect(() => {
    const fetchShelterPoints = async () => {
      if (!showShelterPoints || !center) return;

      const overpassUrl = `https://overpass-api.de/api/interpreter`;
      const query = `
        [out:json];
        (
          node["amenity"~"community_centre|shelter"](around:10000,${center.lat},${center.lng});
          way["amenity"~"community_centre|shelter"](around:10000,${center.lat},${center.lng});
        );
        out center;
      `;

      const res = await fetch(overpassUrl, {
        method: "POST",
        body: query,
      });
      const data = await res.json();

      const rawpoints = (data.elements as OverpassElement[]).map((el) => ({
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        name: el.tags?.name || "Shelter Point",
      }));
      const validPoints: ShelterPoint[] = rawpoints.filter(
        (p): p is ShelterPoint => typeof p.lat === "number" && typeof p.lng === "number"
      );

      setShelterPoints(validPoints);
    };

    fetchShelterPoints();
  }, [showShelterPoints, center]);

  const pathPositions = useMemo(
    () => predictedPath.map((point) => [point.lat, point.lon] as [number, number]),
    [predictedPath]
  );

  return (
    <MapContainer style={containerStyle} center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false}>
      <RecenterMap center={center} zoom={zoom} />
      <TileLayer attribution={mapAttribution} url={mapTileUrl} />

      <Marker position={[center.lat, center.lng]} icon={defaultIcon} />
      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]} icon={defaultIcon} />
      ))}

      {openSpaces.map((marker, index) => (
        <Marker key={`open-space-${index}`} position={[marker.lat, marker.lng]} icon={greenIcon} />
      ))}

      {shelterPoints.map((marker, i) => (
        <Marker key={`shelter-${i}`} position={[marker.lat, marker.lng]} icon={blueIcon}>
          <Tooltip direction="top" offset={[0, -10]}>
            {marker.name}
          </Tooltip>
        </Marker>
      ))}

      {pathPositions.length > 1 && (
        <Polyline positions={pathPositions} pathOptions={{ color: "#FF0000", weight: 3, opacity: 0.8 }} />
      )}
    </MapContainer>
  );
};

export default LeafletMapBox;
