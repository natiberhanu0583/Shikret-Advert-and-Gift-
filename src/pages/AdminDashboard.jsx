import React, { useState, useEffect, useRef } from 'react';
import { Package, FileText, Settings as ConfigIcon, LogOut, CheckCircle, Trash2, Edit, UploadCloud, MessageCircle, Heart } from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders');

  // Data State
  const [orders, setOrders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState({
    phone: '', email: '', address: '',
    heroTitle: 'Brand Identity',
    heroSubtitle: 'Shikret offers premium printing...',
  });

  // Post Form State
  const [editingPostId, setEditingPostId] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Printing Services', subCategory: '', image: '', price: '' });
  
  const [customMainCat, setCustomMainMainCat] = useState('');
  const [useCustomMainCat, setUseCustomMainCat] = useState(false);
  
  const [customSubCat, setCustomSubCat] = useState('');
  const [useCustomSubCat, setUseCustomSubCat] = useState(false);

  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch Data on Load
  useEffect(() => {
    fetchOrders();
    fetchPosts();
    fetchSettings();
  }, []);

  // Removed redundant internal login handlers as they are now in ProtectedAdminDashboard

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`);
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error('Error fetching orders:', e); }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`);
      if (res.ok) setPosts(await res.json());
    } catch (e) { console.error('Error fetching posts:', e); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (e) { console.error('Error fetching settings:', e); }
  };

  // Actions
  const handleOrderStatus = async (id, status) => {
    console.log(`🔵 CLIENT: Updating Order #${id} to ${status}...`);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notified) {
          alert(`Order status updated to ${status}. Notification dispatched successfully to the customer!`);
        }
      }
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  const handleMarkAsPaid = async (id, paid) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/paid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid })
      });
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Determine the final subcategory to save
      const finalMainCategory = useCustomMainCat ? customMainCat : newPost.category;
      const finalSubCategory = useCustomSubCat ? customSubCat : newPost.subCategory;
      let finalImageUrl = newPost.image;

      try {
        if (uploadFile) {
          const formData = new FormData();
          formData.append('image', uploadFile);
          const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: formData });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            finalImageUrl = uploadData.url;
          }
        }

        const payload = {
          ...newPost,
          category: finalMainCategory,
          subCategory: finalSubCategory,
          image: finalImageUrl
        };

        let response;
        if (editingPostId) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${editingPostId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
        } else {
          response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
        }

        if (response.ok) {
          alert('Saved successfully!');
          setEditingPostId(null);
          setNewPost({ title: '', content: '', category: 'Printing Services', subCategory: '', image: '', price: '' });
          setCustomMainMainCat(''); setUseCustomMainCat(false);
          setCustomSubCat(''); setUseCustomSubCat(false);
          setUploadFile(null);
          fetchPosts();
        }
      } catch (e) { console.error(e); } finally { setUploading(false); }
    };

  const handleEditClick = (post) => {
    window.scrollTo(0, 0);
    setEditingPostId(post.id);
    setUseCustomSubCat(false);
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setNewPost({
      title: post.title,
      content: post.content,
      category: post.category,
      subCategory: post.subCategory,
      image: post.image,
      price: post.price || ''
    });
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service permanently?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this order history?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, { method: 'DELETE' });
      fetchOrders();
    } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this customer comment?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/comment/${commentId}`, { method: 'DELETE' });
      fetchPosts();
    } catch (e) { console.error(e); }
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Global web settings updated successfully!');
    } catch (e) { console.error(e); }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  // --- Dynamic Category Logic ---
  const staticMainCats = ['Printing Services', 'Advertising', 'Web & App Development', 'Gift Equipment Making'];
  const allMainCats = [...new Set([...staticMainCats, ...posts.map(p => p.category)])];
  const currentMainCat = useCustomMainCat ? customMainCat : newPost.category;
  const existingSubCats = [...new Set(posts.filter(p => p.category === currentMainCat && p.subCategory).map(p => p.subCategory))];

  const handleMainCategorySelect = (e) => {
    const val = e.target.value;
    if (val === 'NEW_MAIN_OPTION') {
      setUseCustomMainCat(true);
      setCustomMainMainCat('');
      setUseCustomSubCat(true);
      setCustomSubCat('');
    } else {
      setUseCustomMainCat(false);
      setNewPost(prev => ({ ...prev, category: val, subCategory: '' }));
      setUseCustomSubCat(false);
    }
  };

  const handleSubCategorySelect = (e) => {
    const val = e.target.value;
    if (val === 'NEW_SUB_OPTION') {
      setUseCustomSubCat(true);
      setCustomSubCat('');
    } else {
      setUseCustomSubCat(false);
      setNewPost(prev => ({ ...prev, subCategory: val }));
    }
  };

  // UI Components
  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`tab-btn ${activeTab === id ? 'active' : ''}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', 
        background: activeTab === id ? 'var(--primary)' : 'transparent',
        color: activeTab === id ? '#fff' : 'var(--text-muted)',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        fontSize: '1.1rem', transition: 'var(--transition)',
        whiteSpace: 'nowrap'
      }}
    >
      <Icon size={20} /> <span className="tab-label">{label}</span>
    </button>
  );

  const postsWithInteractions = posts.filter(p => p.likes > 0 || (p.comments && p.comments.length > 0));

  // Group orders by User's Contact Identifier (Phone/Email mapping)
  const groupedOrders = {};
  orders.forEach(o => {
    const key = o.phone || o.email || `${o.first_name} ${o.last_name}`;
    if (!groupedOrders[key]) groupedOrders[key] = [];
    groupedOrders[key].push(o);
  });

  return (
    <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar / Top Navigation */}
      <aside className="admin-sidebar" style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--glass-border)', padding: '2rem' }}>
        <h2 className="heading-gradient hidden-mobile" style={{ marginBottom: '3rem', fontSize: '1.8rem' }}>Admin Panel</h2>
        <div className="admin-tabs" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <TabButton id="orders" icon={Package} label="Orders" />
          <TabButton id="interactions" icon={MessageCircle} label="Likes & Comments" />
          <TabButton id="posts" icon={FileText} label="Services Manager" />
          <TabButton id="settings" icon={ConfigIcon} label="Web Interfaces" />
          
          <div className="admin-sidebar-footer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left', padding: '0.5rem 0', fontSize: '1rem' }}>
              <LogOut size={20} /> <span className="hidden-mobile">Sign Out Admin</span>
            </button>
            <div style={{ marginTop: '0.5rem' }}>
              <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                 <span className="hidden-mobile">View Website</span>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '2rem' }}>Manage Customer Orders</h1>
            {Object.keys(groupedOrders).length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {Object.entries(groupedOrders).map(([userKey, userOrders]) => (
                  <div key={userKey} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Customer Header Group */}
                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                        👤 {userOrders[0].first_name} {userOrders[0].last_name}
                      </h3>
                      <span style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                        Contact Info: {userKey}
                      </span>
                    </div>

                    {/* Customer's Individual Items */}
                    <h4 style={{ color: 'var(--text-muted)' }}>Requested Items & Interactions: ({userOrders.length})</h4>
                    {userOrders.map(o => (
                      <div key={o.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${o.status === 'delivered' ? '#4ade80' : 'var(--accent)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--text)' }}>Project: {o.service}</strong>
                          <span style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderRadius: '20px', background: o.status === 'delivered' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(234, 179, 8, 0.2)', color: o.status === 'delivered' ? '#4ade80' : '#eab308', border: `1px solid ${o.status === 'delivered' ? '#4ade80' : '#eab308'}` }}>
                            {o.status.toUpperCase()}
                          </span>
                        </div>

                        {o.details && (
                          <p style={{ marginBottom: o.audioUrl ? '1.5rem' : '0', color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--glass-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            📝 "{o.details}"
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          {o.audioUrl && (
                            <div style={{ flex: '1 1 200px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--primary)', padding: '1rem', borderRadius: '8px' }}>
                              <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🎤 Voice Requirement
                              </p>
                              <audio src={o.audioUrl} controls style={{ height: '40px', width: '100%' }}></audio>
                            </div>
                          )}

                          {o.screenshotUrl && (
                            <div style={{ flex: '1 1 200px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', padding: '1rem', borderRadius: '8px' }}>
                              <p style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📸 Payment Screenshot
                              </p>
                              <img
                                src={o.screenshotUrl}
                                alt="Payment Proof"
                                style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', cursor: 'zoom-in', borderRadius: '4px' }}
                                onClick={() => window.open(o.screenshotUrl, '_blank')}
                              />
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Received at: {new Date(o.created_at || Date.now()).toLocaleString()}
                          </span>

                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>

                            {/* PAID STATUS BUTTON */}
                            {o.paid ? (
                              <span style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ✅ PAYMENT VERIFIED
                              </span>
                            ) : (
                              <button onClick={() => handleMarkAsPaid(o.id, true)} className="btn" style={{ background: 'linear-gradient(45deg, #fbbf24, #d97706)', color: 'white', padding: '0.5rem 1.2rem', border: 'none' }}>
                                💰 Approve & Mark as Paid
                              </button>
                            )}

                            {o.status !== 'preparing' && o.status !== 'completed' && o.status !== 'delivered' && (
                              <button onClick={() => handleOrderStatus(o.id, 'preparing')} className="btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.5rem 1rem', border: '1px solid #3b82f6', fontSize: '0.85rem' }}>
                                🛠️ Set Preparing
                              </button>
                            )}

                            {o.status === 'preparing' && (
                              <button onClick={() => handleOrderStatus(o.id, 'completed')} className="btn" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.5rem 1rem', border: '1px solid #8b5cf6', fontSize: '0.85rem' }}>
                                ✨ Set Completed
                              </button>
                            )}

                            {o.status !== 'delivered' && (
                              <button onClick={() => handleOrderStatus(o.id, 'delivered')} className="btn" style={{ background: 'linear-gradient(45deg, #10b981, #059669)', color: 'white', padding: '0.5rem 1.2rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                                <CheckCircle size={18} /> Mark as Delivered
                              </button>
                            )}
                            <button onClick={() => handleDeleteOrder(o.id)} className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem', color: '#f87171', background: 'rgba(255,0,0,0.1)', border: 'none' }}>
                              <Trash2 size={18} /> Delete Order
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIKES & COMMENTS TAB */}
        {activeTab === 'interactions' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '2rem' }}>Customer Reactions Scanner</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Review all public comments and 'likes' registered on your service items.</p>

            {postsWithInteractions.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <MessageCircle size={40} color="var(--primary)" style={{ opacity: 0.5, margin: '0 auto 1rem auto' }} />
                <p style={{ color: 'var(--text-muted)' }}>No comments or likes submitted on your items yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '2rem' }}>
                {postsWithInteractions.map(post => (
                  <div key={post.id} className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {post.image && <img src={post.image} alt="Thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />}
                        <div>
                          <h3 style={{ fontSize: '1.3rem' }}>{post.title}</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>under {post.subCategory} ({post.category})</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(236,72,153,0.1)', color: 'var(--secondary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(236,72,153,0.2)' }}>
                        <Heart size={20} fill={(post.likes > 0) ? 'var(--secondary)' : 'none'} />
                        <span style={{ fontWeight: 'bold' }}>{post.likes || 0}</span>
                      </div>
                    </div>

                    <div style={{ paddingLeft: '1rem' }}>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageCircle size={18} /> Customer Feedbacks ({post.comments?.length || 0})</h4>

                      {(!post.comments || post.comments.length === 0) ? (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No private feedback on this post yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {post.comments.map((c, i) => (
                            <div key={c.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                              <div>
                                {c.user && (
                                  <div style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'var(--glass-bg)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>👤 {c.user.name}</span>
                                    <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>[{c.user.contactMethod.toUpperCase()}: {c.user.contactValue}]</span>
                                  </div>
                                )}
                                <p style={{ marginBottom: '0.8rem', color: 'var(--text)', lineHeight: 1.4, fontSize: '1.05rem', fontStyle: 'italic' }}>"{c.text}"</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  Registered on {new Date(c.date).toLocaleDateString()} at {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(post.id, c.id)}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem', color: '#f87171', background: 'rgba(255,0,0,0.1)', border: 'none' }}
                                title="Delete Customer Comment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* POSTS / SERVICES TAB */}
        {activeTab === 'posts' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '2rem' }}>Manage Sub-Categories & Details</h1>
            <div className="grid-cols-2" style={{ display: 'grid', gap: '2rem', alignItems: 'flex-start' }}>

              {/* Form */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {editingPostId ? 'Edit Existing Item' : 'Create New Item'}
                  {editingPostId && (
                    <button type="button" onClick={() => { setEditingPostId(null); setNewPost({ title: '', content: '', category: 'Printing Services', subCategory: '', image: '', price: '' }); setUseCustomSubCat(false); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Cancel Edit</button>
                  )}
                </h3>
                <form onSubmit={handlePostSubmit}>
                  <div className="form-group">
                    <label className="form-label">Main Business Capability (Category)</label>
                    {!useCustomMainCat ? (
                      <select className="form-control" value={newPost.category} onChange={handleMainCategorySelect} required>
                         {allMainCats.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                         <option value="NEW_MAIN_OPTION" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✨ Add NEW Main Category...</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <input type="text" className="form-control" value={customMainCat} onChange={e => setCustomMainMainCat(e.target.value)} placeholder="Type new Main Category..." required style={{ flex: 1 }} />
                         <button type="button" onClick={() => setUseCustomMainCat(false)} className="btn btn-secondary">Back</button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sub-Category Navigation Button</label>
                    {!useCustomSubCat ? (
                      <select className="form-control" value={newPost.subCategory} onChange={handleSubCategorySelect} required>
                        {existingSubCats.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        <option value="NEW_SUB_OPTION" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✨ Add NEW Button Option...</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" className="form-control" value={customSubCat} onChange={e => setCustomSubCat(e.target.value)} placeholder="Type new Button Name..." required style={{ flex: 1 }} />
                        {existingSubCats.length > 0 && <button type="button" onClick={() => setUseCustomSubCat(false)} className="btn btn-secondary">Back</button>}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Specific Item Title</label>
                      <input type="text" className="form-control" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="e.g. Premium Rollup Banners" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price / Value (Optional)</label>
                      <input type="text" className="form-control" value={newPost.price} onChange={e => setNewPost({ ...newPost, price: e.target.value })} placeholder="$99.99" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Item Picture Upload</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: '0.8rem',
                        background: isDragging ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.2)',
                        padding: '1.5rem', borderRadius: '8px',
                        border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--glass-border)'}`,
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <UploadCloud size={24} color={isDragging ? 'var(--primary)' : 'var(--text-muted)'} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 500, color: 'var(--text)' }}>
                            {uploadFile ? uploadFile.name : 'Drag & drop image here or click to browse'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={e => setUploadFile(e.target.files[0])}
                        style={{ color: 'var(--text-muted)', width: '100%', cursor: 'pointer' }}
                      />
                      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>OR alternatively, paste an image link below:</p>
                      </div>
                      <input type="url" className="form-control" value={newPost.image} onChange={e => setNewPost({ ...newPost, image: e.target.value })} placeholder="https://example.com/image.jpg" style={{ background: 'transparent' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Detailed Information</label>
                    <textarea className="form-control" rows="4" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} required></textarea>
                  </div>

                  <button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%', background: editingPostId ? 'var(--accent)' : '', opacity: uploading ? 0.7 : 1 }}>
                    {uploading ? 'Processing & Uploading...' : (editingPostId ? 'Update Service Item' : 'Publish Item')}
                  </button>
                </form>
              </div>

              {/* View Posts List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No added services yet.</p> : null}
                {posts.map(post => (
                  <div key={post.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {post.image && (
                      <div style={{ width: '100px', flexShrink: 0 }}>
                        <img src={post.image} alt={post.title} style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', padding: '2px' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'inline-block', background: 'var(--glass-bg)', padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', color: 'var(--primary)', marginBottom: '0.3rem', marginRight: '0.5rem' }}>
                        {post.category}
                      </span>
                      {post.subCategory && (
                        <span style={{ display: 'inline-block', background: 'rgba(236, 72, 153, 0.2)', padding: '0.2rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px', color: 'var(--secondary)', marginBottom: '0.3rem' }}>
                          {post.subCategory}
                        </span>
                      )}
                      <h4 style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
                        {post.title}
                        {post.price && <span style={{ color: '#4ade80' }}>{post.price}</span>}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{post.content}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button onClick={() => handleEditClick(post)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: 'red', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* WEB INTERFACES SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <h1 style={{ marginBottom: '2rem' }}>Global Web Interfaces</h1>
            <form onSubmit={handleUpdateSettings} className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>

              <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>Main Homepage Texts</h3>
              <div className="grid grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hero Title Element</label>
                  <input type="text" className="form-control" value={settings.heroTitle || ''} onChange={e => setSettings({ ...settings, heroTitle: e.target.value })} placeholder="Brand Identity" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Hero Subtitle Text</label>
                <textarea className="form-control" rows="3" value={settings.heroSubtitle || ''} onChange={e => setSettings({ ...settings, heroSubtitle: e.target.value })} placeholder="Shikret offers premium printing..."></textarea>
              </div>

              <h3 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>Contact Information</h3>
              <div className="form-group">
                <label className="form-label">Public Phone Number</label>
                <input type="text" className="form-control" value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Public Email Address</label>
                <input type="email" className="form-control" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">Office Location / Address</label>
                <textarea className="form-control" rows="2" value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })}></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Save Interface Changes</button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};

// Add check for authentication before rendering the dashboard
const ProtectedAdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('admin_authenticated') === 'true');
  const [passwordInput, setPasswordInput] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (passwordInput === adminPass) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', marginBottom: '1.5rem' }}>
            <Package size={32} color="var(--primary)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Admin Secure Login</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Shikret Advert & Gift Official Authorization Required</p>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Office Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Unlock Dashboard</button>
          <a href="/" style={{ display: 'block', marginTop: '1.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Homepage</a>
        </form>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  }} />;
};

export default ProtectedAdminDashboard;
