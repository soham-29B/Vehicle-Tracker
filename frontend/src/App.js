import { useState, useEffect, useMemo } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import MapView from './MapView';
import './App.css';
import { computeMovementStatus, deriveStatus } from './utils/vehicleStatus';


function App() {
  const [vehicles, setVehicles] = useState(new Map());
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        client.subscribe('/topic/vehicles', (message) => {
          const incoming = JSON.parse(message.body);

          setVehicles(prev => {
            const prevVehicle = prev.get(incoming.id);
            const movementStatus = computeMovementStatus(prevVehicle, incoming);
            const enriched = { ...incoming, movementStatus };

            const next = new Map(prev);
            next.set(incoming.id, { ...enriched, status: deriveStatus(enriched, Date.now()) });
            return next;
          });

          setSelectedVehicle(prev => {
            if (prev && prev.id === incoming.id) {
              setRoutePoints(pts => [...pts, {
                latitude: incoming.latitude,
                longitude: incoming.longitude,
              }]);
            }
            return prev;
          });
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetch(`http://localhost:8080/api/vehicles/${selectedVehicle.id}/route`)
          .then(res => res.json())
          .then(data => setRoutePoints(data));
    } else {
      setRoutePoints([]);
    }
  }, [selectedVehicle]);

  const vehicleList = useMemo(() => Array.from(vehicles.values()), [vehicles]);

  return (
      <div className="app-container">
        <header className="app-header">
          <h1>Vehicle Tracker</h1>
        </header>

        <div className="app-body">
          <aside className="sidebar">
            <h2>Vehicles</h2>
            {vehicleList.map(vehicle => (
                <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      margin: '4px',
                      background: selectedVehicle?.id === vehicle.id ? '#cce5ff' : '#eee',
                    }}
                >
                  {vehicle.driverName}
                </div>
            ))}
          </aside>

          <main className="map-area">
            <MapView
                vehicles={vehicleList}
                selectedVehicle={selectedVehicle}
                routePoints={routePoints}
            />
          </main>
        </div>
      </div>
  );
}

export default App;