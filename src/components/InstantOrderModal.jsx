import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const InstantOrderModal = ({ isOpen, request, user, onClose }) => {
  if (!isOpen || !request || !request.item) return null;

  const item = request.item;
  const type = request.type; // 'voice' or 'text'

  const [details, setDetails] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error'
  
  // Screenshot Upload state
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Initialize from user or clear
  useEffect(() => {
    if (user && user.contactMethod === 'phone') {
      setPhoneNumber(user.contactValue);
    } else {
      setPhoneNumber('');
    }
    setDetails('');
    setAudioBlob(null);
    setScreenshotFile(null);
    setStatus(null);
    setIsRecording(false);
    clearInterval(timerRef.current);
  }, [user, isOpen, request]);

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or missing.", err);
      alert("Microphone access is required to send a voice message.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    // Explicit Validation based on type
    if (type === 'text' && !details.trim()) {
      alert('Please provide your order details in the text area.');
      return;
    }
    if (type === 'voice' && !audioBlob && !details.trim()) {
        alert('Please record a voice message or type a description.');
        return;
    }

    setIsSubmitting(true);
    setStatus(null);

    let audioUrl = null;
    let screenshotUrl = null;

    try {
      // 1. Upload audio if it exists
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-message.webm');
        
        const uploadRes = await fetch('http://localhost:3001/api/upload-audio', {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          audioUrl = uploadData.url;
        }
      }

      // 2. Upload screenshot if it exists
      if (screenshotFile) {
          setIsUploadingScreenshot(true);
          const formData = new FormData();
          formData.append('image', screenshotFile);
          const uploadRes = await fetch('http://localhost:3001/api/upload', {
              method: 'POST',
              body: formData
          });
          if(uploadRes.ok) {
              const uploadData = await uploadRes.json();
              screenshotUrl = uploadData.url;
          }
          setIsUploadingScreenshot(false);
      }

      // 3. Submit Order
      const orderPayload = {
        firstName: user ? user.name : 'Instant',
        lastName: 'Order',
        phone: phoneNumber,
        contactMethod: user ? user.contactMethod : 'phone',
        contactValue: user ? user.contactValue : phoneNumber,
        itemTitle: `INSTANT: ${item.title}`,
        details: details,
        audioUrl: audioUrl,
        screenshotUrl: screenshotUrl
      };

      const orderRes = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (orderRes.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Order submission failed:", err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2rem', textAlign: 'center' }}>
          <CheckCircle size={60} color="#4ade80" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ marginBottom: '1rem' }}>Order Sent Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Our team has instantly received your secure requirements. We will review it and contact you at <strong>{phoneNumber}</strong> shortly.</p>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative', overflow: 'hidden' }}>
        
        <button onClick={() => { stopRecording(); onClose(); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}>
          <X size={24} />
        </button>
        
        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             {type === 'voice' ? <Mic size={24} color="var(--primary)" /> : <FileText size={24} color="var(--primary)" />}
             {type === 'voice' ? 'Voice Message Order' : 'Text Details Order'}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
             <div>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{item.category} / {item.subCategory}</p>
             </div>
             {item.price && (
                <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '0.3rem 0.8rem', borderRadius: '30px', fontWeight: 'bold', border: '1px solid rgba(74, 222, 128, 0.2)', fontSize: '1rem' }}>
                   {item.price}
                </div>
             )}
          </div>
          
          <form onSubmit={handleSubmit}>
             <div className="form-group">
                <label className="form-label">Contact Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phoneNumber} 
                  onChange={e => setPhoneNumber(e.target.value)} 
                  placeholder="+1 (555) 000-0000" 
                  required 
                />
             </div>

             {/* VOICE ORDER MODE */}
             {type === 'voice' && (
                <>
                   <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Voice Recording Requirement</label>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px dashed var(--primary)', textAlign: 'center' }}>
                         
                         {!isRecording && !audioBlob && (
                            <div>
                               <button type="button" onClick={startRecording} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Mic size={18} color="var(--primary)" /> Start Voice Recording
                               </button>
                               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>Record a quick voice message explaining your needs specifically.</p>
                            </div>
                         )}

                         {isRecording && (
                            <div className="animate-pulse">
                               <p style={{ fontWeight: 'bold', color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                  <span style={{ width: '10px', height: '10px', background: '#f87171', borderRadius: '50%', display: 'inline-block' }}></span> 
                                  Recording... {formatTime(recordingTime)}
                               </p>
                               <button type="button" onClick={stopRecording} className="btn" style={{ background: 'rgba(255,0,0,0.2)', color: '#f87171', border: '1px solid #f87171' }}>
                                  <Square size={16} style={{ marginRight: '0.5rem' }} /> Stop Recording
                               </button>
                            </div>
                         )}

                         {audioBlob && !isRecording && (
                            <div>
                               <p style={{ color: '#4ade80', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                  <CheckCircle size={18} /> Voice message recorded!
                               </p>
                               <audio src={URL.createObjectURL(audioBlob)} controls style={{ width: '100%', height: '40px', marginBottom: '1rem', borderRadius: '8px' }}></audio>
                               <button type="button" onClick={() => setAudioBlob(null)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                  Delete & Rerecord
                               </button>
                            </div>
                         )}

                      </div>
                   </div>

                   <div className="form-group" style={{ marginBottom: '2rem' }}>
                      <label className="form-label" style={{ color: 'var(--text-muted)' }}>Additional Written Information (Optional)</label>
                      <textarea 
                        className="form-control" 
                        rows="1" 
                        value={details} 
                        onChange={e => setDetails(e.target.value)} 
                        placeholder="Add tiny details here if needed..."
                        style={{ border: '1px solid var(--glass-border)' }}
                      ></textarea>
                   </div>
                </>
             )}

             {/* TEXT ORDER MODE */}
             {type === 'text' && (
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                   <label className="form-label">Full Written Instructions (Required)</label>
                   <textarea 
                     className="form-control" 
                     rows="4" 
                     value={details} 
                     onChange={e => setDetails(e.target.value)} 
                     placeholder="Please describe exactly what you need in detail, including sizes, customizations, or deadlines..."
                     style={{ border: '1px solid var(--glass-border)' }}
                     required
                   ></textarea>
                </div>
             )}

             {/* PAYMENT SCREENSHOT SECTION */}
             <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   📸 Attach Payment Screenshot (Optional but recommended)
                </label>
                <div style={{ position: 'relative', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setScreenshotFile(e.target.files[0])}
                      style={{ width: '100%', fontSize: '0.9rem', color: 'var(--text-muted)' }}
                   />
                   {screenshotFile && (
                      <p style={{ marginTop: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem' }}>
                         Selected: {screenshotFile.name}
                      </p>
                   )}
                </div>
             </div>

             {status === 'error' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '1rem', background: 'rgba(255,0,0,0.1)', padding: '0.8rem', borderRadius: '8px' }}>
                   <AlertCircle size={18} /> Failed to submit order. Please try again.
                </div>
             )}

             <button type="submit" disabled={isSubmitting || isRecording || isUploadingScreenshot} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (isSubmitting || isRecording || isUploadingScreenshot) ? 0.6 : 1 }}>
               {isSubmitting ? (isUploadingScreenshot ? 'Uploading Screenshot...' : 'Sending Order securely...') : <><Send size={20} /> Submit Instant Order</>}
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstantOrderModal;
