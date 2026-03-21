import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  const [settings, setSettings] = useState({
    heroTitle: 'Brand Identity',
    heroSubtitle: 'Shikret offers premium printing, cutting-edge advertising, state-of-the-art web development, and personalized gift making services designed to make your business shine.'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/settings');
        if (res.ok) {
           const data = await res.json();
           setSettings(prev => ({...prev, ...data}));
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="home" style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh', display: 'flex', alignItems: 'center' }} className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'center' }} className="grid-cols-2">
        <div className="animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--glass-bg)', borderRadius: '20px', border: '1px solid var(--glass-border)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <Sparkles size={16} /> Premium Printing & Advertising
          </div>
          <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Elevate Your <br /> 
            <span className="heading-gradient">{settings.heroTitle}</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px' }}>
            {settings.heroSubtitle}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#order" className="btn btn-primary">
              Start Your Order <ArrowRight size={20} />
            </a>
            <a href="#services" className="btn btn-secondary">
              Explore Services
            </a>
          </div>
        </div>
        
        <div className="animate-fade-in stagger-2" style={{ position: 'relative' }}>
          {/* Abstract glowing background element */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--primary) 0%, rgba(6, 182, 212, 0) 70%)', filter: 'blur(60px)', opacity: 0.3, zIndex: -1 }}></div>
          
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop" 
              alt="Studio Experience" 
              style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '240px' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem' }}>Creative Studio</h4>
                <p style={{ color: 'var(--text-muted)' }}>Printing & Full Stack Digital</p>
              </div>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                10yr+
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
