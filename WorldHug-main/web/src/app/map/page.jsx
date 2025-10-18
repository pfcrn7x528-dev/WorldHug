'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

export default function MapPage() {
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/participants');
      if (!response.ok) throw new Error('Failed to fetch participants');
      const data = await response.json();
      setParticipants(data.participants.filter(p => p.latitude && p.longitude));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const center = { lat: 20, lng: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[#D4E8F0] py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C5F7C] text-center font-serif">
            The World Hug
          </h1>
          <p className="text-center text-[#5A8FA8] mt-2 text-lg italic">
            Global Map of Peace
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-[#D4E8F0] py-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <a href="/" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
            Home
          </a>
          <a href="/map" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg bg-[#E8F4F8] font-medium">
            Global Map
          </a>
          <a href="/chat" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
            Chat
          </a>
          <a href="/events" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
            Events
          </a>
        </div>
      </nav>

      {/* Map Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#D4E8F0]">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#2C5F7C] mb-2">
              Chain of Peace Around the World
            </h2>
            <p className="text-[#5A8FA8]">
              {participants.length} participants connected across the globe
            </p>
          </div>

          {loading && (
            <div className="h-[600px] flex items-center justify-center bg-[#E8F4F8] rounded-lg">
              <p className="text-[#5A8FA8]">Loading map...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="h-[600px] rounded-lg overflow-hidden">
              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultCenter={center}
                  defaultZoom={2}
                  mapId="world-hug-map"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  {participants.map((participant) => (
                    <AdvancedMarker
                      key={participant.id}
                      position={{ lat: parseFloat(participant.latitude), lng: parseFloat(participant.longitude) }}
                      onClick={() => setSelectedParticipant(participant)}
                    >
                      <div className="w-8 h-8 bg-[#2C5F7C] rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                    </AdvancedMarker>
                  ))}

                  {selectedParticipant && (
                    <InfoWindow
                      position={{
                        lat: parseFloat(selectedParticipant.latitude),
                        lng: parseFloat(selectedParticipant.longitude)
                      }}
                      onCloseClick={() => setSelectedParticipant(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-bold text-[#2C5F7C] mb-1">
                          {selectedParticipant.name}
                        </h3>
                        <p className="text-sm text-[#5A8FA8] mb-1">
                          {selectedParticipant.location}
                        </p>
                        {selectedParticipant.country && (
                          <p className="text-sm text-[#5A8FA8] mb-2">
                            {selectedParticipant.country}
                          </p>
                        )}
                        {selectedParticipant.message_of_peace && (
                          <p className="text-sm italic text-gray-700 mt-2 max-w-xs">
                            "{selectedParticipant.message_of_peace}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Chain position: #{selectedParticipant.chain_position}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            </div>
          )}
        </div>

        {/* Participants List */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-[#D4E8F0]">
          <h3 className="text-xl font-bold text-[#2C5F7C] mb-4">
            Recent Chain Links
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participants.slice(0, 20).map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 bg-[#E8F4F8] rounded-lg hover:bg-[#D4E8F0] transition-colors cursor-pointer"
                onClick={() => setSelectedParticipant(participant)}
              >
                <div>
                  <p className="font-medium text-[#2C5F7C]">
                    #{participant.chain_position} - {participant.name}
                  </p>
                  <p className="text-sm text-[#5A8FA8]">
                    {participant.location}
                  </p>
                </div>
                {participant.photo_url && (
                  <img
                    src={participant.photo_url}
                    alt={participant.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D4E8F0] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-[#5A8FA8]">
          <p className="font-medium">The World Hug</p>
          <p className="text-sm mt-2">Peace circles the globe faster than conflict</p>
        </div>
      </footer>
    </div>
  );
}
