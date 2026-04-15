import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';

const CATEGORIES = [
  'Technical', 'Cultural', 'Educational',
  'Business', 'Entertainment', 'Social', 'Sports'
];

export default function OrganizerDashboard() {

  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('events');
  const [showForm, setShowForm]       = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Technical',
    date: '', location: '', venue: '',
    capacity: 100, price: 0, tags: ''
  });

  const [imageFile, setImageFile]     = useState(null);
  const [imageUrl, setImageUrl]       = useState('');      // ✅ URL input
  const [imageMode, setImageMode]     = useState('file');  // ✅ 'file' | 'url'
  const [submitting, setSubmitting]   = useState(false);
  const [participants, setParticipants] = useState([]);

  useEffect(() => { fetchMyEvents(); }, []);

  const fetchMyEvents = async () => {
    try {
      const { data } = await api.get('/events/myevents');
      setEvents(data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));

      if (imageMode === 'file' && imageFile) {
        formData.append('image', imageFile);        // ✅ file upload
      } else if (imageMode === 'url' && imageUrl) {
        formData.append('imageUrl', imageUrl);      // ✅ URL upload
      }

      await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Event created! 🎉');
      setShowForm(false);
      setForm({
        title: '', description: '', category: 'Technical',
        date: '', location: '', venue: '',
        capacity: 100, price: 0, tags: ''
      });
      setImageFile(null);
      setImageUrl('');
      setImageMode('file');
      fetchMyEvents();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const viewParticipants = async (eventId) => {
    setActiveTab('participants');
    try {
      const { data } = await api.get(`/registrations/event/${eventId}`);
      setParticipants(data);
    } catch {
      toast.error('Failed to load participants');
    }
  };

  return (
    <div style={{ paddingTop: 90, minHeight: '100vh' }}>
      <div className="container section">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 40,
            flexWrap: 'wrap', gap: 16
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36 }}>
              Organizer <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
              Manage your events and participants
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-glow"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <FiPlus size={16} />
            {showForm ? 'Cancel' : 'Create Event'}
          </button>
        </motion.div>

        {/* ── Stats Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16, marginBottom: 36
        }}>
          {[
            { label: 'Total Events', value: events.length, icon: '🎪' },
            {
              label: 'Total Registrations',
              value: events.reduce((sum, e) => sum + e.registrationCount, 0),
              icon: '🎟️'
            },
            {
              label: 'Upcoming',
              value: events.filter(e => e.status === 'upcoming').length,
              icon: '📅'
            },
          ].map(stat => (
            <div key={stat.label} className="glass-card"
              style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32 }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Create Event Form ── */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 40 }}
          >
            <div className="glass-card" style={{ padding: 36 }}>
              <h2 style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700, fontSize: 22, marginBottom: 28
              }}>
                Create New Event
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                  {/* Title */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Event Title *
                    </label>
                    <input
                      className="input-glass"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Amazing Tech Conference 2025"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Category *
                    </label>
                    <select
                      className="input-glass"
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      style={{ cursor: 'pointer' }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}
                          style={{ background: '#1a1a2e', color: '#f8fafc' }}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Date & Time *
                    </label>
                    <input
                      className="input-glass"
                      type="datetime-local"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      required
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      City / Location *
                    </label>
                    <input
                      className="input-glass"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="Hyderabad, Telangana"
                      required
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Venue
                    </label>
                    <input
                      className="input-glass"
                      value={form.venue}
                      onChange={e => setForm({ ...form, venue: e.target.value })}
                      placeholder="HICC Convention Center"
                    />
                  </div>

                  {/* Capacity */}
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Capacity
                    </label>
                    <input
                      className="input-glass"
                      type="number"
                      min={1}
                      value={form.capacity}
                      onChange={e => setForm({ ...form, capacity: e.target.value })}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Price (₹) · 0 = Free
                    </label>
                    <input
                      className="input-glass"
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                    />
                  </div>

                  {/* Tags */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Tags (comma-separated)
                    </label>
                    <input
                      className="input-glass"
                      value={form.tags}
                      onChange={e => setForm({ ...form, tags: e.target.value })}
                      placeholder="react, javascript, web, technology"
                    />
                  </div>

                  {/* Description */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                      Description *
                    </label>
                    <textarea
                      className="input-glass"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe your event in detail..."
                      required
                      style={{ resize: 'vertical', minHeight: 120 }}
                    />
                  </div>

                  {/* ✅ Image — Toggle between File Upload and URL */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                      Event Banner Image
                    </label>

                    {/* Mode Toggle Buttons */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      {[
                        { mode: 'file', label: '📁 Upload File' },
                        { mode: 'url',  label: '🔗 Paste URL'   },
                      ].map(({ mode, label }) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setImageMode(mode);
                            setImageFile(null);
                            setImageUrl('');
                          }}
                          style={{
                            padding: '7px 18px',
                            borderRadius: 10,
                            border: imageMode === mode
                              ? '1px solid rgba(124,58,237,0.6)'
                              : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: 13,
                            background: imageMode === mode
                              ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(249,115,22,0.3))'
                              : 'rgba(255,255,255,0.05)',
                            color: 'white',
                            transition: 'all 0.2s',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* File Input */}
                    {imageMode === 'file' && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setImageFile(e.target.files[0])}
                          style={{ color: 'var(--text-primary)', fontSize: 14 }}
                        />
                        {imageFile && (
                          <p style={{ color: '#43e97b', fontSize: 13, marginTop: 6 }}>
                            ✓ {imageFile.name}
                          </p>
                        )}
                      </div>
                    )}

                    {/* URL Input + Live Preview */}
                    {imageMode === 'url' && (
                      <div>
                        <input
                          type="url"
                          className="input-glass"
                          placeholder="https://example.com/banner.jpg"
                          value={imageUrl}
                          onChange={e => setImageUrl(e.target.value)}
                        />
                        {/* Live preview */}
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="preview"
                            onError={e  => e.target.style.display = 'none'}
                            onLoad={e   => e.target.style.display = 'block'}
                            style={{
                              display: 'none',
                              marginTop: 12,
                              width: '100%',
                              height: 160,
                              objectFit: 'cover',
                              borderRadius: 12,
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                </div>{/* end grid */}

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-glow"
                  disabled={submitting}
                  style={{
                    marginTop: 24, padding: '14px 40px',
                    fontSize: 15, opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? '⏳ Creating...' : '🚀 Create Event'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Tab Buttons ── */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 50, padding: 4,
          width: 'fit-content', marginBottom: 28
        }}>
          {[
            ['events', '🎪 My Events'],
            ['participants', '👥 Participants']
          ].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 24px', borderRadius: 50,
                border: 'none', cursor: 'pointer',
                background: activeTab === tab
                  ? 'linear-gradient(135deg,#7c3aed,#f97316)'
                  : 'transparent',
                color: 'white',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600, fontSize: 14,
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── MY EVENTS TAB ── */}
        {activeTab === 'events' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {events.map((event, i) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="glass-card" style={{
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20, flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                        {event.title}
                      </div>
                      <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 13, flexWrap: 'wrap' }}>
                        <span>{event.category}</span>
                        <span>📅 {format(new Date(event.date), 'MMM d, yyyy')}</span>
                        <span>📍 {event.location}</span>
                        <span>🎟️ {event.registrationCount}/{event.capacity}</span>
                        <span style={{ color: event.price === 0 ? '#43e97b' : '#f97316', fontWeight: 600 }}>
                          {event.price === 0 ? 'Free' : `₹${event.price}`}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => viewParticipants(event._id)}
                        style={{
                          background: 'rgba(96,165,250,0.1)',
                          border: '1px solid rgba(96,165,250,0.3)',
                          borderRadius: 10, padding: '8px 14px',
                          color: '#60a5fa', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                          gap: 6, fontSize: 13
                        }}
                      >
                        <FiUsers size={14} /> Participants
                      </button>
                      <button
                        onClick={() => deleteEvent(event._id)}
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: 10, padding: '8px 10px',
                          color: '#ef4444', cursor: 'pointer'
                        }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {events.length === 0 && (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎪</div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    No events yet. Click "Create Event" to get started!
                  </p>
                </div>
              )}
            </div>
          )
        )}

        {/* ── PARTICIPANTS TAB ── */}
        {activeTab === 'participants' && (
          <div>
            {participants.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Click "Participants" button on any event to see registrations.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {participants.length} participants registered
                </p>
                {participants.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="glass-card" style={{
                      padding: '16px 20px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#7c3aed,#f97316)',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 800, color: 'white'
                        }}>
                          {p.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{p.user?.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.user?.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
                        <span>#{p.ticketId?.slice(-8)}</span>
                        <span style={{
                          background: '#43e97b22', color: '#43e97b',
                          border: '1px solid #43e97b44',
                          borderRadius: 20, padding: '2px 10px', fontWeight: 700
                        }}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}