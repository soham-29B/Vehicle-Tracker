import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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
        <div class="vehicle-marker-dot"></div>
        ${status === 'moving' ? '<div class="vehicle-marker-pulse-ring"></div>' : ''}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function MapView({ vehicles, selectedVehicle, routePoints }) {
  const [tick, setTick] = useState(0);

  // force re-render every 5s so offline detection fires even with no new WS messages
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

  return (
      <MapContainer
          center={[20.2961, 85.8245]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
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