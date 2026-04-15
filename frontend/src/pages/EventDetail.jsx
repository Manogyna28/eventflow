import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiX, FiChevronRight } from 'react-icons/fi';

// ✅ ADD THIS
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Color for each event category
const categoryColors = {
  Technical:     '#667eea',
  Cultural:      '#f5576c',
  Educational:   '#4facfe',
  Business:      '#43e97b',
  Entertainment: '#fee140',
  Social:        '#fbc2eb',
  Sports:        '#fe5196',
};

function Label({ text }) {
  return (
    <label style={{
      fontSize: 12,
      color: 'var(--text-secondary)',
      display: 'block',
      marginBottom: 6,
      fontWeight: 600,
      letterSpacing: '0.3px'
    }}>
      {text}
    </label>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!event) return null;

  const color = categoryColors[event.category] || '#7c3aed';

  // ✅ FIXED IMAGE URL
  const imageUrl = event.image
    ? event.image.startsWith('http')
      ? event.image
      : `${BASE_URL}${event.image}`
    : null;

  return (
    <div style={{ paddingTop: 72 }}>

      {/* ✅ BANNER FIXED */}
      <div style={{
        height: 400,
        position: 'relative',
        background: imageUrl
          ? `url(${imageUrl}) center/cover`
          : `linear-gradient(135deg, ${color}55, rgba(249,115,22,0.3))`,
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))'
        }} />

        <div style={{ position: 'relative', zIndex: 2, padding: 40 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ color: 'white' }}>{event.title}</h1>
          </motion.div>
        </div>
      </div>

      {/* SIMPLE CONTENT */}
      <div style={{ padding: 24 }}>
        <h2>About</h2>
        <p>{event.description}</p>

        <h3>Date</h3>
        <p>{format(new Date(event.date), 'PPpp')}</p>

        <h3>Location</h3>
        <p>{event.location}</p>
      </div>

    </div>
  );
}