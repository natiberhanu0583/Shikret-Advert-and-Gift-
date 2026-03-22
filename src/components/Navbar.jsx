import React, { useState } from 'react';
import { Menu, X, Printer, Monitor, Video, Gift, Lock } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass-panel" style={{ position: 'fixed', top: '1rem', left: '2rem', right: '2rem', zIndex: 1000, padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
              <Printer size={24} color="#fff" />
            </div>
            <span className="heading-gradient" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px' }}>SHIKRET</span>
          </div>
        </a>

        {/* Desktop Menu */}
        <div className="hidden-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/#home" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Home</a>
          <a href="/#services" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Services</a>
          <a href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', opacity: 0.6, transition: '0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '1'} onMouseLeave={(e) => e.target.style.opacity = '0.6'}>
            <Lock size={12} /> Office Login
          </a>
          <a href="/#order" className="btn btn-primary">Order Now</a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="show-mobile" style={{ display: 'none', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X color="white" /> : <Menu color="white" />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', padding: '1rem 0', borderTop: '1px solid var(--glass-border)' }}>
          <a href="/#home" onClick={() => setIsOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Home</a>
          <a href="/#services" onClick={() => setIsOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Services</a>
          <a href="/admin" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={16} /> Admin Portal
          </a>
          <a href="/#order" onClick={() => setIsOpen(false)} className="btn btn-primary">Order Now</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
