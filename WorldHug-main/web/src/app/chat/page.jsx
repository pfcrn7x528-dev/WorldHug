'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeThread, setActiveThread] = useState('global');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedId = localStorage.getItem('participantId');
    if (storedId) {
      setParticipantId(storedId);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeThread, selectedCountry]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/participants');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      const uniqueCountries = [...new Set(data.participants.map(p => p.country).filter(Boolean))];
      setCountries(uniqueCountries.sort());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      let url = '/api/messages?type=' + activeThread;
      if (activeThread === 'local' && selectedCountry) {
        url += '&country=' + encodeURIComponent(selectedCountry);
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages.reverse());
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_id: participantId,
          message: newMessage,
          message_type: activeThread,
          country: activeThread === 'local' ? selectedCountry : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchToLocal = (country) => {
    setActiveThread('local');
    setSelectedCountry(country);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] to-white">
      {/* Header */}
      <header className="bg-white border-b border-[#D4E8F0] py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C5F7C] text-center font-serif">
            The World Hug
          </h1>
          <p className="text-center text-[#5A8FA8] mt-2 text-lg italic">
            Global Community Chat
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-[#D4E8F0] py-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <a href="/" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
            Home
          </a>
          <a href="/map" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
            Global Map
          </a>
          <a href="/chat" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg bg-[#E8F4F8] font-medium">
            Chat
          </a>
          <a href="/events" className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium">
            Events
          </a>
        </div>
      </nav>

      {/* Chat Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#D4E8F0]">
              <h3 className="text-lg font-bold text-[#2C5F7C] mb-4">
                Chat Threads
              </h3>
              
              <button
                onClick={() => setActiveThread('global')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-medium transition-colors ${
                  activeThread === 'global'
                    ? 'bg-[#2C5F7C] text-white'
                    : 'bg-[#E8F4F8] text-[#2C5F7C] hover:bg-[#D4E8F0]'
                }`}
              >
                🌍 Global Chat
              </button>

              <div className="mt-4">
                <p className="text-sm font-medium text-[#2C5F7C] mb-2">
                  Country Chats
                </p>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => switchToLocal(country)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeThread === 'local' && selectedCountry === country
                          ? 'bg-[#2C5F7C] text-white'
                          : 'bg-[#E8F4F8] text-[#2C5F7C] hover:bg-[#D4E8F0]'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-[#D4E8F0] flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-[#D4E8F0]">
                <h2 className="text-xl font-bold text-[#2C5F7C]">
                  {activeThread === 'global' 
                    ? '🌍 Global Chat' 
                    : `${selectedCountry} Local Chat`}
                </h2>
                <p className="text-sm text-[#5A8FA8]">
                  {activeThread === 'global'
                    ? 'Connect with peace advocates worldwide'
                    : `Connect with others from ${selectedCountry}`}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-[#5A8FA8] mt-8">
                    <p>No messages yet. Be the first to share a message of peace!</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.participant_id === participantId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        msg.participant_id === participantId
                          ? 'bg-[#2C5F7C] text-white'
                          : 'bg-[#E8F4F8] text-[#2C5F7C]'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {msg.participant_name || 'Anonymous'}
                        {msg.participant_country && ` (${msg.participant_country})`}
                      </p>
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-6 py-4 border-t border-[#D4E8F0]">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
                    {error}
                  </div>
                )}

                {!participantId && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg mb-3 text-sm">
                    <a href="/" className="underline font-medium">Join the chain</a> to send messages
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={participantId ? "Type your message..." : "Join the chain to chat"}
                    disabled={!participantId || loading}
                    className="flex-1 px-4 py-3 border border-[#D4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A8FA8] disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!participantId || loading || !newMessage.trim()}
                    className="px-6 py-3 bg-[#2C5F7C] text-white font-medium rounded-lg hover:bg-[#5A8FA8] transition-colors disabled:bg-gray-400"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
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
