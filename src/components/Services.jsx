import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Megaphone, MonitorSmartphone, Gift, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import API_BASE_URL from '../api_config';

const ServiceCard = ({ icon: Icon, title, id, dynamicPosts, onExploreClick }) => {
  const { t } = useLanguage();
  // Extract unique subcategories from the dynamic posts for this specific column
  const subCategories = [...new Set(dynamicPosts.map(p => p.subCategory).filter(Boolean))];

  return (
    <div 
      className="glass-panel" 
      onClick={(e) => {
        // Prevent click if we clicked a specific sub-category button inside
        if(e.target.tagName !== 'BUTTON') {
           onExploreClick(id);
        }
      }}
      style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', cursor: 'pointer', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px var(--glass-border)' }}>
          <Icon size={32} color="var(--primary)" />
        </div>
        
        {dynamicPosts.length > 0 && (
          <button onClick={(e) => { e.stopPropagation(); onExploreClick(id); }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {t('services_explore')} <ArrowRight size={14} />
          </button>
        )}
      </div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t(title)}</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        
        {/* Dynamic Buttons (Sub-Categories) */}
        {subCategories.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {subCategories.map((sub, idx) => (
              <button 
                key={idx} 
                className="btn btn-secondary"
                onClick={(e) => { e.stopPropagation(); onExploreClick(id, sub); }}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(236, 72, 153, 0.3)', zIndex: 2 }}
              >
                {sub}
              </button>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t('services_no_items')}</p>
        )}

      </div>
      
      {/* Visual cue that the whole card is clickable */}
      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           {t('services_click_hint')} <ArrowRight size={16} />
        </p>
      </div>
    </div>
  );
}

const Services = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/posts`);
        if (res.ok) setPosts(await res.json());
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };
    fetchServices();
  }, []);

  const handleExploreClick = (categoryId, tab = null) => {
    let url = `/services/${encodeURIComponent(categoryId)}`;
    if (tab) url += `?tab=${encodeURIComponent(tab)}`;
    navigate(url);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  const categories = [
    { id: 'Printing Services', icon: Printer, title: 'Printing Services' },
    { id: 'Advertising', icon: Megaphone, title: 'Advertising Agency' },
    { id: 'Web & App Development', icon: MonitorSmartphone, title: 'Web & App Development' },
    { id: 'Gift Equipment Making', icon: Gift, title: 'Gift Equipment Making' }
  ];

  return (
    <section id="services" style={{ padding: '6rem 0', background: 'var(--bg-surface)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }} className="heading-gradient">{t('services_title')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            {t('services_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-4" style={{ display: 'grid', gap: '2rem' }}>
          {categories.map((category, idx) => {
            // Filter dynamic posts for THIS specific category
            const categoryPosts = posts.filter(post => post.category === category.id);
            
            return (
              <div key={idx} className={`animate-fade-in stagger-${(idx % 4) + 1}`} style={{ display: 'flex', height: '100%' }}>
                <ServiceCard 
                  icon={category.icon} 
                  title={category.title} 
                  id={category.id}
                  dynamicPosts={categoryPosts}
                  onExploreClick={handleExploreClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
