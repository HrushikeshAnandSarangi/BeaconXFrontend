"use client"

import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

type Disaster = {
  type: string;
  id: string;
};

type DisasterIconsProps = {
  type?: string;
  count?: number;
  disasters?: Disaster[];
};

// const router = useRouter();

const AlertIcon = ({ className = "" }: { className?: string }) => (
  <Image
    src="/alert-icon.png"
    alt="Alert"
    width={120}
    height={120}
    className={className}
    priority
  />
);

const EarthquakeIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M2 12l4-4 3 5 4-6 3 4 5-5v3l-4 4-3-4-4 6-3-5-5 5v-3z" />
  </svg>
);

const WaveIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 14c2 2 4 2 6 0s4-2 6 0 4 2 8 0" />
    <path d="M2 18c2 2 4 2 6 0s4-2 6 0 4 2 8 0" />
  </svg>
);

export default function DisasterIcons({
  type,
  count,
  disasters: externalDisasters,
}: DisasterIconsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [internalDisasters, setInternalDisasters] = useState<Disaster[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; dragging: boolean } | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
      if (externalDisasters) {
        setInternalDisasters(externalDisasters);
      } else if (type && count) {
        const converted = Array.from({ length: count }, (_, i) => ({
          type,
          id: `legacy-${i}`,
        }));
        setInternalDisasters(converted);
      }
    }, 500);
  }, [type, count, externalDisasters]);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!dragRef.current?.dragging) return;
      const deltaX = event.clientX - dragRef.current.startX;
      const deltaY = event.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.originX + deltaX,
        y: dragRef.current.originY + deltaY,
      });
    };

    const handleUp = () => {
      if (dragRef.current) {
        dragRef.current.dragging = false;
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-alert-menu]")) {
        setShowOptions(false);
      }
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const disasterCounts = internalDisasters.reduce((acc, disaster) => {
    acc[disaster.type] = (acc[disaster.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const disasterTypes = Object.keys(disasterCounts);
  return (
    <div
      className="fixed top-1 right-6 z-50 flex flex-col items-end"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-alert-menu
    >
      <div className="relative group">

        <Link
          href="#"
          className="relative flex h-40 w-40 items-center justify-center"
          aria-label={`${internalDisasters.length} alerts - Click for details`}
          onPointerDown={(event) => {
            event.preventDefault();
            dragRef.current = {
              startX: event.clientX,
              startY: event.clientY,
              originX: position.x,
              originY: position.y,
              dragging: true,
            };
          }}
          onDoubleClick={(event) => {
            event.preventDefault();
            setShowOptions((prev) => !prev);
          }}
        >
          <span className="absolute inset-0 animate-ripple rounded-full border-2 border-teal-300 opacity-40"></span>
          <span className="absolute inset-0 animate-ripple2 rounded-full border-2 border-teal-200 opacity-30"></span>

          {!isLoaded ? (
            <span className="text-white text-sm">...</span>
          ) : (
            <div className="relative h-32 w-32">
              <AlertIcon className="absolute transition-opacity duration-300 opacity-100" />
            </div>
          )}

        </Link>
      </div>

      {showOptions && isLoaded && internalDisasters.length > 0 && (
        <div className="mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="py-1">
            <div className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold border-b">
              Active Alerts ({internalDisasters.length})
            </div>

            {internalDisasters.map((disaster, index) => (
              <Link
                key={disaster.id}
                href={`/${disaster.type === "earthquake" ? "earthquakePage" : "cyclonePage"}`}
                className={`flex items-center px-4 py-3 hover:bg-red-50 transition-colors ${
                  index !== internalDisasters.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {disaster.type === "earthquake" ? (
                    <EarthquakeIcon className="h-5 w-5 text-red-600" />
                  ) : (
                    <WaveIcon className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {disaster.type} alert #{index + 1}
                  </p>
                  <p className="text-xs text-gray-500">Click for details</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}