import { calculateDistanceKm } from './geo';

export const OFFLINE_THRESHOLD_MS = 30000; // no update in 30s => offline
export const MOVEMENT_DISTANCE_THRESHOLD_KM = 0.01; // ~10m between updates counts as movement

// Called ONLY when a new WS message arrives — needs the previous known
// position to compare against. No previous point (first sighting) => idle.
export function computeMovementStatus(prevVehicle, incoming) {
    if (!prevVehicle) return 'idle';

    const distanceKm = calculateDistanceKm(
        prevVehicle.latitude, prevVehicle.longitude,
        incoming.latitude, incoming.longitude
    );

    return distanceKm > MOVEMENT_DISTANCE_THRESHOLD_KM ? 'moving' : 'idle';
}

// Called on every tick AND on message arrival — only checks staleness.
// Relies on movementStatus already being stamped onto the vehicle object.
export function deriveStatus(vehicle, now = Date.now()) {
    if (!vehicle?.lastUpdated) return 'offline';

    const ageMs = now - new Date(vehicle.lastUpdated).getTime();
    if (ageMs > OFFLINE_THRESHOLD_MS) return 'offline';

    return vehicle.movementStatus ?? 'idle';
}