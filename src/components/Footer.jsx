import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [settings, setSettings] = useState({
    phone: '+1 (555) 123-4567',
    email: 'info@shikret.com',
    address: 'Main Office Street, 123\nBusiness City, BC 4567'
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

  return (
    <footer style={{ background: '#050505', borderTop: '1px solid var(--glass-border)', padding: '4rem 0 2rem 0' }}>
      <div className="container">
        <div className="grid grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <h3 className="heading-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>SHIKRET</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '250px' }}>
              Your one-stop destination for premium printing, impactful advertising, custom web development, and memorable gift making.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.2rem', color: 'var(--text)' }}>Services</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)' }}>
              <li><a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Printing Services</a></li>
              <li><a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Advertising Agency</a></li>
              <li><a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Web Development</a></li>
              <li><a href="#services" style={{ color: 'inherit', textDecoration: 'none' }}>Gift Equipment Making</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.2rem', color: 'var(--text)' }}>Contact Info</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-line' }}>
              <li>{settings.address}</li>
              <li>{settings.email}</li>
              <li>{settings.phone}</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.2rem', color: 'var(--text)' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <a href="#" className="glass-panel" style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                 FB
               </a>
               <a href="#" className="glass-panel" style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                 IG
               </a>
               <a href="#" className="glass-panel" style={{ width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                 TW
               </a>
            </div>
          </div>
        </div>
        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div>&copy; {new Date().getFullYear()} Shikret Printing & Advertising. All rights reserved.</div>
          <a href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.8rem', border: '1px solid var(--glass-border)', transition: '0.3s' }} onMouseEnter={(e) => {e.target.style.background='rgba(255,255,255,0.1)'; e.target.style.color='#fff'}} onMouseLeave={(e) => {e.target.style.background='rgba(255,255,255,0.05)'; e.target.style.color='var(--text-muted)'}}>
            Admin Portal Access
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
