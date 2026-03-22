import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import InstantOrderModal from '../components/InstantOrderModal';

const ServiceDetails = () => {
  const { t } = useLanguage();
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const decodedCategory = decodeURIComponent(categoryId);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [instantOrderItem, setInstantOrderItem] = useState(null);

  const [commentInputs, setCommentInputs] = useState({});
  const [commentStatus, setCommentStatus] = useState({}); 

  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab');

  const fetchServices = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`);
      if (res.ok) {
        const allPosts = await res.json();
        setPosts(allPosts.filter(p => p.category === decodedCategory));
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [decodedCategory]);

  const requireAuth = (actionCallback) => {
    const userStr = localStorage.getItem('shikret_user');
    if (userStr) {
      actionCallback(JSON.parse(userStr));
    } else {
      setPendingAction(() => actionCallback);
      setShowLogin(true);
    }
  };

  const onLoginSuccess = (userProfile) => {
    if (pendingAction) {
      pendingAction(userProfile);
      setPendingAction(null);
    }
  };

  const handleLike = (postId) => {
    requireAuth(async (user) => {
      try {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
        await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/like`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user })
        });
      } catch (e) {
        console.error(e);
        fetchServices();
      }
    });
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    requireAuth(async (user) => {
      try {
        setCommentStatus({ ...commentStatus, [postId]: 'sending' });
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, user })
        });
        
        if (res.ok) {
           setCommentInputs({ ...commentInputs, [postId]: '' });
           setCommentStatus({ ...commentStatus, [postId]: 'success' });
           setTimeout(() => {
              setCommentStatus(prev => ({ ...prev, [postId]: null }));
           }, 4000);
        } else {
           setCommentStatus({ ...commentStatus, [postId]: 'error' });
        }
      } catch (err) {
        console.error(err);
        setCommentStatus({ ...commentStatus, [postId]: 'error' });
      }
    });
  };

  const subCategories = [...new Set(posts.map(p => p.subCategory).filter(Boolean))];
  const activeSubCategory = currentTab && posts.some(p => p.subCategory === currentTab)
    ? currentTab 
    : (subCategories.length > 0 ? subCategories[0] : null);

  const displayedPosts = activeSubCategory 
    ? posts.filter(p => p.subCategory === activeSubCategory)
    : posts;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <LoginModal isOpen={showLogin} onClose={() => { setShowLogin(false); setPendingAction(null); }} onSuccess={onLoginSuccess} />
      <InstantOrderModal 
        isOpen={!!instantOrderItem} request={instantOrderItem}
        user={localStorage.getItem('shikret_user') ? JSON.parse(localStorage.getItem('shikret_user')) : null}
        onClose={() => setInstantOrderItem(null)} />

      {lightboxImage && (
        <div onClick={() => setLightboxImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '1rem' }}>
           <img src={lightboxImage} alt="Fullscreen" style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: '8px' }} />
        </div>
      )}

      <Navbar />
      
      <main style={{ flex: 1, paddingTop: '8rem', paddingBottom: '4rem', background: 'var(--bg)' }} className="container">
        <Link to="/" className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', padding: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={20} /> {t('details_back')}
        </Link>

        <h1 className="heading-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t(decodedCategory)}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px' }}>
          {t('details_subtitle')}
        </p>

        {loading ? (
           <p style={{ color: 'var(--text-muted)' }}>{t('details_loading')}</p>
        ) : (
          <>
            {subCategories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
                {subCategories.map((sub, idx) => (
                  <button key={idx} onClick={() => navigate(`/services/${encodeURIComponent(decodedCategory)}?tab=${encodeURIComponent(sub)}`)}
                    className={activeSubCategory === sub ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ borderRadius: '8px', padding: '0.8rem 1.5rem' }}>
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {displayedPosts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                 <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t('details_empty')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {displayedPosts.map(post => (
                  <div key={post.id} className="glass-panel animate-fade-in" style={{ padding: '2rem', display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                     <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
                       {post.image ? (
                         <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-in', padding: '1rem', border: '1px solid var(--glass-border)' }} onClick={() => setLightboxImage(post.image)}>
                           <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                         </div>
                       ) : (
                         <div style={{ width: '100%', height: '300px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                           {t('details_img_placeholder')}
                         </div>
                       )}
                     </div>

                     <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '2rem', color: 'var(--text)', margin: 0 }}>{post.title}</h3>
                          {post.price && <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '0.4rem 1rem', borderRadius: '30px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>{post.price}</span>}
                       </div>
                       <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                       
                       <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', flexWrap: 'wrap' }}>
                          <button onClick={() => handleLike(post.id)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)', border: '1px solid rgba(236,72,153,0.3)' }}>
                            <Heart size={20} fill={(post.likes > 0) ? 'var(--secondary)' : 'none'} />
                            <span>{post.likes || 0} Likes</span>
                          </button>
                          
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                             <button onClick={() => requireAuth(() => setInstantOrderItem({ item: post, type: 'voice' }))} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(45deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🎤 {t('details_voice_order')}
                             </button>
                             <button onClick={() => requireAuth(() => setInstantOrderItem({ item: post, type: 'text' }))} className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)' }}>
                                📝 {t('details_text_order')}
                             </button>
                          </div>
                       </div>

                       {/* Optional Custom CTA Button */}
                       {post.buttonLabel && post.buttonUrl && (
                         <div style={{ marginBottom: '1.5rem' }}>
                           <a
                             href={post.buttonUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             style={{
                               display: 'inline-flex',
                               alignItems: 'center',
                               gap: '0.5rem',
                               padding: '0.7rem 1.8rem',
                               background: 'linear-gradient(45deg, var(--primary), var(--accent))',
                               color: '#fff',
                               borderRadius: '10px',
                               fontWeight: 700,
                               fontSize: '1rem',
                               textDecoration: 'none',
                               boxShadow: '0 4px 15px rgba(6,182,212,0.3)',
                               transition: 'transform 0.2s, box-shadow 0.2s'
                             }}
                             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(6,182,212,0.45)'; }}
                             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(6,182,212,0.3)'; }}
                           >
                             {post.buttonLabel} →
                           </a>
                         </div>
                       )}

                       <div style={{ marginTop: '0.5rem' }}>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text)' }}>
                            <MessageCircle size={18} color="var(--primary)" /> {t('details_feedback_title')}
                          </h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('details_feedback_desc')}</p>

                          {commentStatus[post.id] === 'success' && <div style={{ background: 'rgba(0,255,0,0.1)', color: '#4ade80', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>✅ {t('details_feedback_success')}</div>}
                          {commentStatus[post.id] === 'error' && <div style={{ background: 'rgba(255,0,0,0.1)', color: '#f87171', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>❌ Error</div>}

                          <form onSubmit={(e) => handleCommentSubmit(post.id, e)} style={{ display: 'flex', gap: '0.8rem' }}>
                             <input type="text" className="form-control" placeholder={t('details_feedback_placeholder')} value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})} style={{ flex: 1, marginBottom: 0 }} />
                             <button type="submit" disabled={commentStatus[post.id] === 'sending'} className="btn btn-primary" style={{ padding: '0 1.2rem' }}>
                                {commentStatus[post.id] === 'sending' ? '...' : <Send size={18} />}
                             </button>
                          </form>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetails;
