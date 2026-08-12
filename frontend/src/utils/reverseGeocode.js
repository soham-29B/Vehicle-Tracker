const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function reverseGeocode(lat, lon) {
    const url = `${NOMINATIM_URL}?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) throw new Error('Reverse geocoding failed');

    const data = await res.json();
    const addr = data.address || {};
    const parts = [addr.road, addr.suburb || addr.neighbourhood || addr.village].filter(Boolean);

    return parts.length > 0
        ? parts.join(', ')
        : (data.display_name?.split(',').slice(0, 2).join(',') ?? 'Unknown location');
}