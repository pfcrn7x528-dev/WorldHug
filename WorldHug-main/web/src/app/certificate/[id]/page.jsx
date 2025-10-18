'use client';

import { useState, useEffect } from 'react';

export default function CertificatePage({ params }) {
  const [participant, setParticipant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParticipant();
  }, []);

  const fetchParticipant = async () => {
    try {
      const response = await fetch(`/api/participants/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch participant');
      const data = await response.json();
      setParticipant(data.participant);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F4F8]">
        <p className="text-[#5A8FA8] text-xl">Loading certificate...</p>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F4F8]">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Error: {error || 'Participant not found'}</p>
          <a href="/" className="text-[#2C5F7C] underline">Return to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white">
      {/* Header - Hide on print */}
      <header className="bg-white border-b border-[#D4E8F0] py-6 print:hidden">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C5F7C] text-center font-serif">
            The World Hug
          </h1>
          <p className="text-center text-[#5A8FA8] mt-2 text-lg italic">
            Certificate of Participation
          </p>
        </div>
      </header>

      {/* Navigation - Hide on print */}
      <nav className="bg-white border-b border-[#D4E8F0] py-3 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <a href="/" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
            Home
          </a>
          <a href="/map" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
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

      {/* Certificate */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Print Button - Hide on print */}
        <div className="mb-8 text-center print:hidden">
          <button
            onClick={handlePrint}
            className="px-8 py-3 bg-[#2C5F7C] text-white font-bold rounded-lg hover:bg-[#5A8FA8] transition-colors text-lg"
          >
            🖨️ Print Certificate
          </button>
        </div>

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 border-8 border-[#2C5F7C] print:border-4 print:shadow-none">
          {/* Certificate Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-5xl font-bold text-[#2C5F7C] mb-2 font-serif">
              The World Hug
            </h2>
            <p className="text-2xl text-[#5A8FA8] italic">
              Certificate of Participation
            </p>
          </div>

          {/* Certificate Body */}
          <div className="border-t-2 border-b-2 border-[#D4E8F0] py-8 mb-8">
            <p className="text-center text-lg text-gray-700 mb-6">
              This certifies that
            </p>
            
            <h3 className="text-4xl font-bold text-[#2C5F7C] text-center mb-6">
              {participant.name}
            </h3>

            {participant.photo_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={participant.photo_url}
                  alt={participant.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#2C5F7C] shadow-lg"
                />
              </div>
            )}

            <p className="text-center text-lg text-gray-700 mb-2">
              from <span className="font-bold text-[#2C5F7C]">{participant.location}</span>
              {participant.country && <span>, {participant.country}</span>}
            </p>

            <p className="text-center text-lg text-gray-700 mb-6">
              has joined the global chain of peace as
            </p>

            <div className="text-center">
              <div className="inline-block bg-[#E8F4F8] px-8 py-4 rounded-lg border-2 border-[#2C5F7C]">
                <p className="text-3xl font-bold text-[#2C5F7C]">
                  Chain Link #{participant.chain_position}
                </p>
              </div>
            </div>
          </div>

          {/* Message of Peace */}
          {participant.message_of_peace && (
            <div className="mb-8">
              <p className="text-center text-sm font-medium text-[#5A8FA8] mb-2">
                Message of Peace
              </p>
              <p className="text-center text-lg italic text-gray-700 bg-[#E8F4F8] p-6 rounded-lg">
                "{participant.message_of_peace}"
              </p>
            </div>
          )}

          {/* Certificate Footer */}
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Joined on {new Date(participant.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-[#5A8FA8] italic text-lg mt-4">
              "Not politics decides — people do!"
            </p>
          </div>

          {/* Decorative Border */}
          <div className="mt-8 pt-8 border-t-2 border-[#D4E8F0]">
            <p className="text-center text-sm text-gray-500">
              Certificate ID: {participant.id} | worldhug.org
            </p>
          </div>
        </div>

        {/* Action Buttons - Hide on print */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <a
            href="/map"
            className="px-6 py-3 bg-[#E8F4F8] text-[#2C5F7C] font-medium rounded-lg hover:bg-[#D4E8F0] transition-colors text-center"
          >
            View on Global Map
          </a>
          <a
            href="/chat"
            className="px-6 py-3 bg-[#E8F4F8] text-[#2C5F7C] font-medium rounded-lg hover:bg-[#D4E8F0] transition-colors text-center"
          >
            Join Global Chat
          </a>
          <a
            href="/events"
            className="px-6 py-3 bg-[#E8F4F8] text-[#2C5F7C] font-medium rounded-lg hover:bg-[#D4E8F0] transition-colors text-center"
          >
            Find Peace Events
          </a>
        </div>
      </main>

      {/* Footer - Hide on print */}
      <footer className="bg-white border-t border-[#D4E8F0] py-8 mt-20 print:hidden">
        <div className="max-w-6xl mx-auto px-4 text-center text-[#5A8FA8]">
          <p className="font-medium">The World Hug</p>
          <p className="text-sm mt-2">Peace circles the globe faster than conflict</p>
        </div>
      </footer>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-4 {
            border-width: 4px !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
