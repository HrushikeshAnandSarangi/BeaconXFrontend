"use client"

import dynamic from "next/dynamic";
import React from "react";

type Props = {
  center?: { lat: number; lng: number };
  markers?: { lat: number; lng: number }[];
  mapTypeId?: "roadmap" | "satellite" | "hybrid" | "terrain";
  zoom?: number;
  showOpenSpaces?: boolean;
  showShelterPoints?: boolean;
  predictedPath?: { lat: number; lon: number }[];
};

const LeafletMapBox = dynamic(() => import("./LeafletMapBox"), {
  ssr: false,
  loading: () => <div className="text-white text-sm p-4">Loading Map...</div>,
});

const GoogleMapBox: React.FC<Props> = (props) => {
  return <LeafletMapBox {...props} />;
};
export default GoogleMapBox;
