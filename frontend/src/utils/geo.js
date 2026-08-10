// utils/geo.js

const EARTH_RADIUS_KM = 6371;

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const latDistance = toRadians(lat2 - lat1);
    const lonDistance = toRadians(lon2 - lon1);

    const a =
        Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(lonDistance / 2) *
        Math.sin(lonDistance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
}