import React, { useState } from 'react';
import { Menu, X, Printer, Monitor, Video, Gift, Lock, Globe } from 'lucide-react';
import { useLanguage, translations } from '../context/LanguageContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="glass-panel" style={{ position: 'fixed', top: '1rem', left: '2rem', right: '2rem', zIndex: 1000, padding: '0.8rem 2rem' }}>
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
          <a href="/#home" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>{t('nav_home')}</a>
          <a href="/#services" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>{t('nav_services')}</a>
          
          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem 0.8rem', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
            <Globe size={16} color="var(--primary)" />
            {Object.keys(translations).map((lang) => (
              <button 
                key={lang} 
                onClick={() => setLanguage(lang)}
                style={{ 
                  background: 'none', border: 'none', color: language === lang ? 'var(--primary)' : 'var(--text-muted)', 
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: language === lang ? 'bold' : 'normal',
                  padding: '2px 6px'
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <a href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', opacity: 0.6, transition: '0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '1'} onMouseLeave={(e) => e.target.style.opacity = '0.6'}>
            <Lock size={12} /> {t('nav_admin')}
          </a>
          <a href="/#order" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>{t('nav_order')}</a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="show-mobile" style={{ display: 'none', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X color="white" /> : <Menu color="white" />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', padding: '1rem 0', borderTop: '1px solid var(--glass-border)' }}>
          <a href="/#home" onClick={() => setIsOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>{t('nav_home')}</a>
          <a href="/#services" onClick={() => setIsOpen(false)} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>{t('nav_services')}</a>
          
          <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0' }}>
            {Object.keys(translations).map((lang) => (
              <button key={lang} onClick={() => { setLanguage(lang); setIsOpen(false); }} style={{ background: language === lang ? 'var(--primary)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.4rem 1rem', borderRadius: '4px' }}>
                {translations[lang][`lang_${lang}`]}
              </button>
            ))}
          </div>

          <a href="/admin" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={16} /> {t('nav_admin')}
          </a>
          <a href="/#order" onClick={() => setIsOpen(false)} className="btn btn-primary">{t('nav_order')}</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
