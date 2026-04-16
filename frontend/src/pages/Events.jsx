import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { FiSearch, FiX } from 'react-icons/fi';

const CATEGORIES = [
  'All', 'Technical', 'Cultural', 'Educational',
  'Business', 'Entertainment', 'Social', 'Sports'
];

export default function Events() {
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const [category, setCategory] = useState(
    searchParams.get('category') || 'All'
  );

  // =========================
  // FETCH EVENTS (FIXED)
  // =========================
  const fetchEvents = async () => {
    setLoading(true);

    try {
      const params = {};

      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      if (location) params.location = location;

      const { data } = await api.get('/events', { params });

      console.log("✅ EVENTS API RESPONSE:", data);

      // SAFE FIX (prevents crash)
      setEvents(Array.isArray(data?.events) ? data.events : []);

    } catch (err) {
      console.error("❌ Failed to load events:");
      console.error(err?.response?.data || err.message);

      setEvents([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  // fetch on category/location change
  useEffect(() => {
    fetchEvents();
  }, [category, location]);

  // search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  // clear filters
  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
  };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(249,115,22,0.1))',
        borderBottom: '1px solid var(--glass-border)',
        padding: '48px 24px 40px',
      }}>
        <div className="container">

          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(32px,5vw,52px)',
            marginBottom: 8
          }}>
            Discover <span className="gradient-text">Events</span>
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 17,
            marginBottom: 32
          }}>
            {loading ? 'Loading...' : `${events.length} events found`}
          </p>

          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 24
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <FiSearch size={16} style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                pointerEvents: 'none'
              }} />

              <input
                className="input-glass"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events, topics, tags..."
                style={{ paddingLeft: 44 }}
              />
            </div>

            <input
              className="input-glass"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location"
              style={{ width: 200 }}
            />

            <button type="submit" className="btn-glow">
              Search
            </button>

            {(search || category !== 'All' || location) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-outline"
              >
                <FiX size={14} /> Clear
              </button>
            )}
          </form>

          {/* CATEGORY FILTER */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  background: category === cat
                    ? 'linear-gradient(135deg, #7c3aed, #f97316)'
                    : 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 50,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* EVENTS LIST */}
      <div className="container section">

        {loading ? (
          <div className="events-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map((event, i) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h3>No events found</h3>
            <p>Try adjusting filters</p>
          </div>
        )}

      </div>

    </div>
  );
}