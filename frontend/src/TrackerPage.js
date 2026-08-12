import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import MapView from './MapView';
import Header from './components/Header';
import { computeMovementStatus, deriveStatus } from './utils/vehicleStatus';
import { calculateDistanceKm } from './utils/geo';
import { formatTimeAgo } from './utils/timeAgo';
import { reverseGeocode } from './utils/reverseGeocode';
import './TrackerPage.css';

const GEOCODE_MIN_INTERVAL_MS = 15000;
const GEOCODE_MIN_DISTANCE_KM = 0.05; // ~50m
const NOT_FOUND_TIMEOUT_MS = 8000;

function TrackerPage() {
    const { plate } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [address, setAddress] = useState(null);
    const [nowTick, setNowTick] = useState(Date.now());
    const [showRoute, setShowRoute] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const prevVehicleRef = useRef(null);
    const lastGeocodedRef = useRef({ position: null, time: 0 });

    // live "time ago" ticker — updates every second
    useEffect(() => {
        const interval = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const targetPlate = decodeURIComponent(plate).trim().toUpperCase();

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                client.subscribe('/topic/vehicles', (message) => {
                    const incoming = JSON.parse(message.body);
                    if (incoming.licensePlate?.trim().toUpperCase() !== targetPlate) return;

                    const movementStatus = computeMovementStatus(prevVehicleRef.current, incoming);
                    const enriched = { ...incoming, movementStatus };
                    const withStatus = { ...enriched, status: deriveStatus(enriched, Date.now()) };

                    prevVehicleRef.current = incoming;
                    setVehicle(withStatus);
                    setRoutePoints(pts => [...pts, { latitude: incoming.latitude, longitude: incoming.longitude }]);
                });
            },
        });

        client.activate();
        return () => client.deactivate();
    }, [plate]);

    // if no matching vehicle arrives within NOT_FOUND_TIMEOUT_MS, assume the plate doesn't exist
    useEffect(() => {
        setNotFound(false); // reset whenever the searched plate changes
        prevVehicleRef.current = null; // reset match-tracking for the new search

        const timeout = setTimeout(() => {
            if (!prevVehicleRef.current) {
                setNotFound(true);
            }
        }, NOT_FOUND_TIMEOUT_MS);

        return () => clearTimeout(timeout);
    }, [plate]);

    // fetch route history once we learn the vehicle's id
    useEffect(() => {
        if (vehicle?.id) {
            fetch(`http://localhost:8080/api/vehicles/${vehicle.id}/route`)
                .then(res => res.json())
                .then(data => setRoutePoints(data));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vehicle?.id]);

    // throttled reverse geocoding — only fires if enough time AND distance has passed
    useEffect(() => {
        if (!vehicle) return;

        const { position: lastPos, time: lastTime } = lastGeocodedRef.current;
        const now = Date.now();
        const movedEnough = !lastPos ||
            calculateDistanceKm(lastPos.lat, lastPos.lon, vehicle.latitude, vehicle.longitude) > GEOCODE_MIN_DISTANCE_KM;
        const enoughTimePassed = now - lastTime > GEOCODE_MIN_INTERVAL_MS;

        if (movedEnough && enoughTimePassed) {
            lastGeocodedRef.current = { position: { lat: vehicle.latitude, lon: vehicle.longitude }, time: now };
            reverseGeocode(vehicle.latitude, vehicle.longitude)
                .then(setAddress)
                .catch(() => setAddress('Unable to resolve address'));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vehicle?.latitude, vehicle?.longitude]);

    const statusLabel = vehicle ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : '';

    return (
        <div>
            <Header />
            <div className="tracker-page">
                <button className="back-link" onClick={() => navigate('/')}>&larr; Back</button>

                {!vehicle ? (
                    <div className="map-card">
                        <div className="searching-state">
                            {notFound ? (
                                <div className="not-found-state">
                                    <p>Vehicle "{decodeURIComponent(plate)}" not found.</p>
                                    <button className="back-link" onClick={() => navigate('/')}>
                                        Try another search
                                    </button>
                                </div>
                            ) : (
                                `Looking for vehicle "${decodeURIComponent(plate)}"...`
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="map-card">
                            <div className={`status-pill-overlay ${vehicle.status}`}>
                                <span className="live-dot" /> {statusLabel}
                            </div>
                            <button
                                className="route-toggle-overlay"
                                onClick={() => setShowRoute(prev => !prev)}
                            >
                                {showRoute ? 'Hide Route' : 'Show Route'}
                            </button>
                            <MapView
                                vehicles={[vehicle]}
                                selectedVehicle={vehicle}
                                routePoints={showRoute ? routePoints : []}
                                focusVehicle
                            />
                        </div>

                        <div className="detail-card">
                            <div className="detail-card-top">
                                <div className="vehicle-info">
                                    <div className="vehicle-icon-box">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <path d="M3 17h1a2 2 0 0 0 4 0h8a2 2 0 0 0 4 0h1v-5l-3-4h-3V6H5a2 2 0 0 0-2 2v9z" />
                                            <circle cx="7.5" cy="17.5" r="1.5" />
                                            <circle cx="17.5" cy="17.5" r="1.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="vehicle-label">Vehicle</div>
                                        <div className="vehicle-plate">{vehicle.licensePlate}</div>
                                    </div>
                                </div>
                                <div className={`status-pill-overlay static ${vehicle.status}`}>
                                    <span className="live-dot" /> {statusLabel}
                                </div>
                            </div>

                            <div className="detail-row">
                                <span>Status</span>
                                <span className="detail-row-value">{statusLabel}</span>
                            </div>
                            <div className="detail-row">
                                <span>Location</span>
                                <span className="detail-row-value">{address ?? 'Resolving...'}</span>
                            </div>
                            <div className="detail-row">
                                <span>Updated</span>
                                <span className="detail-row-value">{formatTimeAgo(vehicle.lastUpdated, nowTick)}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TrackerPage;