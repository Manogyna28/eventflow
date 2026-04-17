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
// ── 🆕 ADD THIS: reusable input style ──
const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1.5px solid #eee', borderRadius: 8,
  fontSize: 14, marginBottom: 10, outline: 'none',
  fontFamily: 'inherit', background: '#fff', color: '#111'
};

// ── 🆕 ADD THIS: Pay button component ──
function PayButton({ processing, amount, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={processing}
      style={{
        width: '100%', padding: 13,
        background: processing ? '#a78bfa' : '#7c3aed',
        color: '#fff', border: 'none', borderRadius: 10,
        fontSize: 14, fontWeight: 600,
        cursor: processing ? 'not-allowed' : 'pointer',
        marginTop: 4
      }}
    >
      {processing ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
}

// ── 🆕 ADD THIS: full payment modal ──
function PaymentModal({ event, onClose, onSuccess }) {
  const [tab, setTab] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1800)); // simulate delay
    setProcessing(false);
    onSuccess();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 440,
          overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Complete Payment</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888' }}>
            <FiX />
          </button>
        </div>

        {/* Amount */}
        <div style={{ padding: '12px 20px', background: '#f8f4ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>Paying for</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{event.title}</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#7c3aed' }}>
            ₹{event.price || 499}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '0 20px', gap: 4 }}>
          {['upi', 'netbanking', 'card'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 14px', fontSize: 13,
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? '#7c3aed' : '#888',
              borderBottom: tab === t ? '2px solid #7c3aed' : '2px solid transparent'
            }}>
              {t === 'upi' ? 'UPI' : t === 'netbanking' ? 'Net Banking' : 'Card'}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>

          {/* UPI Tab */}
          {tab === 'upi' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { name: 'Google Pay', bg: '#e8f5e9', color: '#34A853', short: 'G' },
                  { name: 'PhonePe',   bg: '#f3e5f5', color: '#5f259f', short: 'Pe' },
                  { name: 'BHIM',      bg: '#e3f2fd', color: '#002970', short: 'B' },
                  { name: 'Paytm',     bg: '#fff8e1', color: '#FF6B00', short: 'Pa' },
                ].map(app => (
                  <button key={app.name} onClick={handlePay} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', border: '1.5px solid #eee',
                    borderRadius: 10, cursor: 'pointer', background: '#fff', textAlign: 'left'
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: app.bg, color: app.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700
                    }}>{app.short}</div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{app.name}</span>
                  </button>
                ))}
              </div>

              <div style={{ textAlign: 'center', color: '#aaa', fontSize: 12, margin: '12px 0', position: 'relative' }}>
                <span style={{ background: '#fff', padding: '0 10px', position: 'relative', zIndex: 1 }}>or enter UPI ID</span>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#eee', zIndex: 0 }} />
              </div>

              <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={inputStyle} />
              <PayButton processing={processing} amount={event.price || 499} onClick={handlePay} />
            </>
          )}

          {/* Net Banking Tab */}
          {tab === 'netbanking' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[
                  { name: 'State Bank of India', short: 'SBI',   bg: '#e3f2fd', color: '#1565C0' },
                  { name: 'HDFC Bank',           short: 'HDFC',  bg: '#e8f5e9', color: '#2E7D32' },
                  { name: 'ICICI Bank',           short: 'ICICI', bg: '#fff3e0', color: '#E65100' },
                  { name: 'Axis Bank',            short: 'AXIS',  bg: '#f3e5f5', color: '#6A1B9A' },
                ].map(bank => (
                  <button key={bank.name} onClick={handlePay} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', border: '1.5px solid #eee',
                    borderRadius: 10, cursor: 'pointer', background: '#fff', textAlign: 'left'
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: bank.bg, color: bank.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700
                    }}>{bank.short}</div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{bank.name}</span>
                  </button>
                ))}
              </div>
              <PayButton processing={processing} amount={event.price || 499} onClick={handlePay} />
            </>
          )}

          {/* Card Tab */}
          {tab === 'card' && (
            <>
              <input placeholder="Card number" maxLength={19} style={inputStyle} />
              <input placeholder="Name on card" style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input placeholder="MM / YY" maxLength={5} style={{ ...inputStyle, marginBottom: 0 }} />
                <input placeholder="CVV" maxLength={3} type="password" style={{ ...inputStyle, marginBottom: 0 }} />
              </div>
              <PayButton processing={processing} amount={event.price || 499} onClick={handlePay} />
              <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 10 }}>
                256-bit SSL encrypted · PCI DSS compliant (mock)
              </p>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

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
  const handlePaymentSuccess = async () => {
    try {
      await api.post(`/registrations/${event._id}`);
      setShowPayment(false);
      toast.success('Registered successfully 🎉');
    } catch {
      toast.error('Registration failed');
    }
  };

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
        <button 
          onClick={() => setShowPayment(true)}
          style={{
            marginTop: 24,
            padding: '14px 32px',
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer'
            }}
          >
            Register & Pay ₹{event.price || 499}
          </button>
      </div>
    {showPayment && (
        <PaymentModal
          event={event}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
}
