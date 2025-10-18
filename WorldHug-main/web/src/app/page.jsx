"use client";

import { useState, useEffect } from "react";
import useUpload from "@/utils/useUpload";

export default function Home() {
  const [upload, { loading: uploading }] = useUpload();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    country: "",
    message_of_peace: "",
    photo_url: "",
  });

  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let photoUrl = formData.photo_url;

      // Upload photo if provided
      if (photoFile) {
        const { url, error: uploadError } = await upload({
          url: URL.createObjectURL(photoFile),
        });
        if (uploadError) {
          throw new Error(uploadError);
        }
        photoUrl = url;
      }

      // Geocode location to get coordinates
      let latitude = null;
      let longitude = null;

      if (formData.location) {
        try {
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.location)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          );
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.results && geocodeData.results.length > 0) {
            latitude = geocodeData.results[0].geometry.location.lat;
            longitude = geocodeData.results[0].geometry.location.lng;
          }
        } catch (geocodeError) {
          console.error("Geocoding error:", geocodeError);
        }
      }

      // Create participant
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photo_url: photoUrl,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join chain");
      }

      const { participant } = await response.json();

      // Store participant ID in localStorage
      localStorage.setItem("participantId", participant.id);

      // Redirect to certificate page
      window.location.href = `/certificate/${participant.id}`;
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            "Not politics decides — people do!"
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-[#D4E8F0] py-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <a
            href="/"
            className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg bg-[#E8F4F8] font-medium"
          >
            Home
          </a>
          <a
            href="/map"
            className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium"
          >
            Global Map
          </a>
          <a
            href="/chat"
            className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium"
          >
            Chat
          </a>
          <a
            href="/events"
            className="text-[#2C5F7C] hover:text-[#5A8FA8] px-4 py-2 rounded-lg hover:bg-[#E8F4F8] font-medium"
          >
            Events
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Stats Banner */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-[#D4E8F0]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#2C5F7C]">
                  {stats.totalParticipants.toLocaleString()}
                </div>
                <div className="text-[#5A8FA8] mt-2">Chain Links</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#2C5F7C]">
                  {stats.countriesReached}
                </div>
                <div className="text-[#5A8FA8] mt-2">Countries Reached</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#2C5F7C]">
                  {stats.percentageOfEarth}%
                </div>
                <div className="text-[#5A8FA8] mt-2">Around the Earth</div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C5F7C] mb-4">
            Join the Global Chain of Peace
          </h2>
          <p className="text-lg text-[#5A8FA8] max-w-2xl mx-auto">
            Be a link in a worldwide human chain. Together, we can show that
            peace and solidarity circle the globe faster than conflict.
          </p>
        </div>

        {/* Join Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#D4E8F0]">
          <h3 className="text-2xl font-bold text-[#2C5F7C] mb-6 text-center">
            Become a Link of Peace
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#2C5F7C] font-medium mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#D4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A8FA8]"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-[#2C5F7C] font-medium mb-2">
                Your Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#D4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A8FA8]"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-[#2C5F7C] font-medium mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#D4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A8FA8]"
                placeholder="e.g., USA, Germany, Japan"
              />
            </div>

            <div>
              <label className="block text-[#2C5F7C] font-medium mb-2">
                Message of Peace (optional)
              </label>
              <textarea
                name="message_of_peace"
                value={formData.message_of_peace}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-[#D4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A8FA8]"
                placeholder="Share your message of peace with the world..."
              />
            </div>

            <div>
              <label className="block text-[#2C5F7C] font-medium mb-2">
                Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-3 border border-[#D4E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5A8FA8]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-[#2C5F7C] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#5A8FA8] transition-colors disabled:bg-gray-400 text-lg"
            >
              {submitting || uploading
                ? "Joining the Chain..."
                : "Join the Chain"}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-[#D4E8F0]">
            <h4 className="text-xl font-bold text-[#2C5F7C] mb-3">
              🌍 Global Unity
            </h4>
            <p className="text-[#5A8FA8]">
              Watch as our human chain grows across continents, connecting
              people from every corner of the world in a peaceful embrace.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#D4E8F0]">
            <h4 className="text-xl font-bold text-[#2C5F7C] mb-3">
              💬 Share Messages
            </h4>
            <p className="text-[#5A8FA8]">
              Connect with others in our global chat, share encouragement, and
              build bridges of understanding.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#D4E8F0] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-[#5A8FA8]">
          <p className="font-medium">The World Hug</p>
          <p className="text-sm mt-2">
            Peace circles the globe faster than conflict
          </p>
        </div>
      </footer>
    </div>
  );
}
