import React, { useState, useEffect } from 'react';

const OrderForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    service: '',
    details: ''
  });
  const [status, setStatus] = useState('');
  const [submittedOrderId, setSubmittedOrderId] = useState(null);
  
  const [settings, setSettings] = useState({
    phone: '+1 (555) 123-4567',
    email: 'orders@shikret.com'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`);
        if (res.ok) {
           const data = await res.json();
           setSettings(prev => ({...prev, ...data}));
        }
      } catch (err) { }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const userStr = localStorage.getItem('shikret_user');
    const user = userStr ? JSON.parse(userStr) : null;

    const payload = {
      ...formData,
      contactMethod: user ? user.contactMethod : (formData.email ? 'email' : 'phone'),
      contactValue: user ? user.contactValue : (formData.email || formData.phone || '')
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const resData = await res.json();
        setSubmittedOrderId(resData.id);
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', service: '', details: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <section id="order" style={{ padding: '6rem 0', background: 'var(--bg)', position: 'relative' }}>
      <div className="container grid-cols-2" style={{ display: 'grid', gap: '4rem', alignItems: 'flex-start' }}>
        <div className="animate-fade-in stagger-1">
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.2 }} className="heading-gradient">Ready to Work Together?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Fill out the form to request a quote or start a new order. Our team will get back to you within 24 hours.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '50%', background: 'var(--glass-bg)', display: 'inline-flex' }}>
                <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Call Us</h4>
                <p style={{ color: 'var(--text-muted)' }}>{settings.phone}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '50%', background: 'var(--glass-bg)', display: 'inline-flex' }}>
                 <svg width="24" height="24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Email Us</h4>
                <p style={{ color: 'var(--text-muted)' }}>{settings.email}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel animate-fade-in stagger-2" style={{ padding: '3rem', width: '100%' }}>
          {status === 'success' && (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', textAlign: 'center', borderColor: '#4ade80', background: 'rgba(74, 222, 128, 0.05)' }}>
              <div style={{ background: '#4ade80', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ marginBottom: '0.8rem' }}>Order Request Received!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Thank you! We've received your inquiry. Get real-time updates directly on Telegram:
              </p>
              <a 
                href={`https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_NAME}?start=order_${submittedOrderId}`} 
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary" 
                style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', width: '100%', padding: '0.8rem' }}
              >
                🚀 Track via Telegram Bot
              </a>
            </div>
          )}
          {status === 'error' && (
            <div style={{ background: 'rgba(255,0,0,0.1)', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              There was an error sending your request. Please try again.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">First Name</label>
              <input type="text" className="form-control" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="John" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input type="text" className="form-control" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Service Required</label>
            <select className="form-control" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} style={{ WebkitAppearance: 'none', appearance: 'none' }} required>
              <option value="" disabled>Select a Service</option>
              <option value="Printing">Printing (Student, Office, Personal)</option>
              <option value="Advertising">Advertising & Branding</option>
              <option value="Web Development">Web & App Development</option>
              <option value="Gift Making">Gift Equipment Making</option>
              <option value="Other">Multiple / Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message Details</label>
            <textarea className="form-control" rows={5} value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="Tell us more about your project goals..." required></textarea>
          </div>

          <button type="submit" disabled={status === 'submitting'} className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1.1rem', opacity: status === 'submitting' ? 0.7 : 1 }}>
            {status === 'submitting' ? 'Submitting...' : 'Submit Order Request'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default OrderForm;
