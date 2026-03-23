import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Printer, Megaphone, MonitorSmartphone, Gift, Star, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../api_config';

// Icon map for known categories - new categories will get a default icon
const ICON_MAP = {
  'Printing Services': Printer,
  'Advertising': Megaphone,
  'Web & App Development': MonitorSmartphone,
  'Gift Equipment Making': Gift,
};

const Hero = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    heroTitle: 'Brand Identity',
    heroSubtitle: 'Shikret offers premium printing, cutting-edge advertising, state-of-the-art web development, and personalized gift making services designed to make your business shine.'
  });
  const [dynamicCategories, setDynamicCategories] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
           const data = await res.json();
           setSettings(prev => ({...prev, ...data}));
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts`);
        if (res.ok) {
          const posts = await res.json();
          // Get unique categories from actual posts + 4 static ones
          const staticCats = ['Printing Services', 'Advertising', 'Web & App Development', 'Gift Equipment Making'];
          const postCats = posts.map(p => p.category).filter(Boolean);
          const allUnique = [...new Set([...staticCats, ...postCats])];
          setDynamicCategories(allUnique.map(cat => ({
            id: cat,
            label: cat,
            icon: ICON_MAP[cat] || Star  // fallback icon for custom categories
          })));
        }
      } catch (err) {
        // Fallback to static on error
        setDynamicCategories([
          { id: 'Printing Services', icon: Printer, label: 'Printing Services' },
          { id: 'Advertising', icon: Megaphone, label: 'Advertising' },
          { id: 'Web & App Development', icon: MonitorSmartphone, label: 'Web & App Development' },
          { id: 'Gift Equipment Making', icon: Gift, label: 'Gift Equipment Making' },
        ]);
      }
    };

    fetchSettings();
    fetchCategories();
  }, []);

  return (
    <section id="home" style={{ paddingTop: '8rem', paddingBottom: '6rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }} className="container">
      
      {/* Dynamic Category Capability Cards */}
      <div className="animate-fade-in capability-grid" style={{ width: '100%', maxWidth: '900px', marginBottom: '1.5rem' }}>
        {dynamicCategories.map((cat, idx) => (
          <Link 
            key={idx}
            to={`/services/${encodeURIComponent(cat.id)}`} 
            className="glass-panel" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '0.8rem', 
              padding: '1.5rem 1rem', 
              textDecoration: 'none', 
              transition: '0.3s',
              border: '1px solid var(--glass-border)'
            }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <cat.icon size={26} color="var(--primary)" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
              {t(cat.label) || cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Quick Call Link */}
      <div className="animate-fade-in" style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em' }}>
           Shikret Advert — <a href="tel:0940219376" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>Call us: 0940219376</a>
        </p>
      </div>

      <div className="animate-fade-in" style={{ maxWidth: '850px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '30px', border: '1px solid rgba(6, 182, 212, 0.2)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '2rem' }}>
          <Sparkles size={16} /> {t('hero_badge')}
        </div>
        
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.8rem)', marginBottom: '1.5rem', lineHeight: 1.05, fontWeight: 800 }}>
          {t('hero_elevate')} <br /> 
          <span className="heading-gradient" style={{ display: 'block', marginTop: '0.5rem' }}>{settings.heroTitle}</span>
        </h1>
        
        <p style={{ fontSize: 'clamp(1rem, 4vw, 1.35rem)', color: 'var(--text-muted)', marginBottom: '3.5rem', maxWidth: '600px', margin: '0 auto 3.5rem auto', lineHeight: 1.6 }}>
          {settings.heroSubtitle}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <a href="#order" className="btn btn-primary" style={{ padding: '1.1rem 2.8rem', fontSize: '1.1rem', borderRadius: '40px', boxShadow: '0 8px 30px rgba(6, 182, 212, 0.3)' }}>
            {t('hero_btn_start')} <ArrowRight size={20} />
          </a>
          <a href="#services" className="btn btn-secondary" style={{ padding: '1.1rem 2.8rem', fontSize: '1.1rem', borderRadius: '40px', border: '1px solid var(--glass-border)', background: 'transparent' }}>
            {t('hero_btn_explore')}
          </a>
        </div>
      </div>

      {/* Gradient Decor */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vh', background: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)', zIndex: -1, pointerEvents: 'none' }}></div>
      
    </section>
  );
};

export default Hero;
