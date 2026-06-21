import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
    const markerRef = useRef(null);
    
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            onLocationSelect(lat, lng);
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    setPosition({ lat, lng });
                    onLocationSelect(lat, lng);
                }
            },
        }),
        [onLocationSelect]
    );

    return position === null ? null : (
        <Marker 
            draggable={true} 
            eventHandlers={eventHandlers} 
            position={position} 
            ref={markerRef} 
        />
    );
};

export default function MapPicker({ defaultLat, defaultLng, onLocationSelect }) {
    // Default to Jakarta if no coordinates
    const initialPosition = {
        lat: defaultLat && !isNaN(parseFloat(defaultLat)) ? parseFloat(defaultLat) : -6.200000,
        lng: defaultLng && !isNaN(parseFloat(defaultLng)) ? parseFloat(defaultLng) : 106.816666
    };
    
    const [position, setPosition] = useState(initialPosition);

    useEffect(() => {
        if (defaultLat && defaultLng && !isNaN(parseFloat(defaultLat)) && !isNaN(parseFloat(defaultLng))) {
            setPosition({
                lat: parseFloat(defaultLat),
                lng: parseFloat(defaultLng)
            });
        }
    }, [defaultLat, defaultLng]);

    return (
        <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner z-0 relative" style={{ zIndex: 0 }}>
            <MapContainer 
                center={initialPosition} 
                zoom={13} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    position={position} 
                    setPosition={setPosition} 
                    onLocationSelect={onLocationSelect} 
                />
            </MapContainer>
        </div>
    );
}
