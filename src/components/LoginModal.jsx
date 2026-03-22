import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Facebook, X } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [method, setMethod] = useState('phone'); // phone, email, telegram, facebook
  const [formData, setFormData] = useState({ name: '', contactValue: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactValue) return;

    const userProfile = {
      name: formData.name,
      contactMethod: method,
      contactValue: formData.contactValue,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('shikret_user', JSON.stringify(userProfile));
    onSuccess(userProfile);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', position: 'relative', overflow: 'hidden' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
          <X size={24} />
        </button>
        
        <div style={{ padding: '2.5rem 2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', textAlign: 'center' }}>Account Registration</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Please register your preferred contact method to place orders, leave reactions, or send messages to the office.
          </p>

          <form onSubmit={handleSubmit}>
             <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" required autoFocus />
             </div>

             <label className="form-label" style={{ marginTop: '1.5rem' }}>Select Platform to Link</label>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div 
                   onClick={() => setMethod('phone')} 
                   style={{ background: method === 'phone' ? 'rgba(6, 182, 212, 0.2)' : 'var(--glass-bg)', border: `1px solid ${method === 'phone' ? 'var(--primary)' : 'var(--glass-border)'}`, padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s' }}
                >
                   <Phone size={18} color={method === 'phone' ? 'var(--primary)' : 'var(--text-muted)'} /> <span>Phone</span>
                </div>
                <div 
                   onClick={() => setMethod('email')} 
                   style={{ background: method === 'email' ? 'rgba(236,72,153,0.2)' : 'var(--glass-bg)', border: `1px solid ${method === 'email' ? 'var(--secondary)' : 'var(--glass-border)'}`, padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s' }}
                >
                   <Mail size={18} color={method === 'email' ? 'var(--secondary)' : 'var(--text-muted)'} /> <span>Gmail (Email)</span>
                </div>
                <div 
                   onClick={() => setMethod('telegram')} 
                   style={{ background: method === 'telegram' ? 'rgba(56,189,248,0.2)' : 'var(--glass-bg)', border: `1px solid ${method === 'telegram' ? '#38bdf8' : 'var(--glass-border)'}`, padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s' }}
                >
                   <MessageCircle size={18} color={method === 'telegram' ? '#38bdf8' : 'var(--text-muted)'} /> <span>Telegram</span>
                </div>
                <div 
                   onClick={() => setMethod('facebook')} 
                   style={{ background: method === 'facebook' ? 'rgba(59,130,246,0.2)' : 'var(--glass-bg)', border: `1px solid ${method === 'facebook' ? '#3b82f6' : 'var(--glass-border)'}`, padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.2s' }}
                >
                   <Facebook size={18} color={method === 'facebook' ? '#3b82f6' : 'var(--text-muted)'} /> <span>Facebook</span>
                </div>
             </div>

             <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">
                  {method === 'phone' && "Enter Phone Number"}
                  {method === 'email' && "Enter Gmail / Email Address"}
                  {method === 'telegram' && (
                    <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      Enter Telegram Chat ID
                      <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.8rem' }}>Get ID from @userinfobot</a>
                    </span>
                  )}
                  {method === 'facebook' && "Enter Facebook Name or Link"}
                </label>
                <input 
                  type={method === 'email' ? 'email' : 'text'} 
                  className="form-control" 
                  value={formData.contactValue} 
                  onChange={e => setFormData({...formData, contactValue: e.target.value})} 
                  placeholder={
                     method === 'phone' ? '+1 (555) 000-0000' :
                     method === 'email' ? 'john@gmail.com' :
                     method === 'telegram' ? 'e.g. 512345678' :
                     'facebook.com/username'
                  } 
                  required 
                />
             </div>

             <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
               Register & Continue
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
