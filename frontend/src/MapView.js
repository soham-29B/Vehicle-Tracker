import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './marker-animations.css';
import { deriveStatus } from './utils/vehicleStatus';

const TICK_INTERVAL_MS = 5000;

const STATUS_COLORS = {
  moving: '#10b981',
  idle: '#6b7280',
  offline: '#ef4444',
};

function createVehicleIcon(status, isSelected) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.offline;
  const animationClass =
      status === 'moving' ? 'marker-pulse' :
          status === 'idle' ? 'marker-idle-tick' : '';

  return L.divIcon({
    className: 'vehicle-marker-wrapper',
    html: `
      <div class="vehicle-marker ${animationClass} ${isSelected ? 'marker-selected' : ''}" style="--marker-color: ${color}">
        <div class="vehicle-marker-ring">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M3 11l18-8-8 18-2-8-8-2z" />
          </svg>
        </div>
        ${status === 'moving' ? '<div class="vehicle-marker-pulse-ring"></div>' : ''}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function RecenterOnVehicle({ vehicle }) {
  const map = useMap();
  useEffect(() => {
    if (vehicle) {
      map.setView([vehicle.latitude, vehicle.longitude], 15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle?.id]);
  return null;
}

function MapView({ vehicles, selectedVehicle, routePoints, focusVehicle }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const vehiclesWithStatus = useMemo(() => {
    const now = Date.now();
    return vehicles.map(v => ({ ...v, status: deriveStatus(v, now) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, tick]);

  const polylinePoints = routePoints.map(p => [p.latitude, p.longitude]);

  const initialCenter = focusVehicle && selectedVehicle
      ? [selectedVehicle.latitude, selectedVehicle.longitude]
      : [20.2961, 85.8245];

  return (
      <MapContainer
          center={initialCenter}
          zoom={focusVehicle ? 15 : 13}
          style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {focusVehicle && <RecenterOnVehicle vehicle={selectedVehicle} />}
        {vehiclesWithStatus.map((vehicle) => (
            <Marker
                key={`${vehicle.id}-${vehicle.lastUpdated}`}
                position={[vehicle.latitude, vehicle.longitude]}
                icon={createVehicleIcon(vehicle.status, selectedVehicle?.id === vehicle.id)}
            >
              <Popup>{vehicle.driverName} — {vehicle.status}</Popup>
            </Marker>
        ))}
        {polylinePoints.length > 1 && (
            <Polyline positions={polylinePoints} color="#10b981" weight={3} />
        )}
      </MapContainer>
  );
}

export default MapView;