import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import OrderForm from './components/OrderForm';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard'; // Import Admin Panel

const Website = () => {
  // Simple intersection observer to trigger fade-in animations on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          entry.target.style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-fade-in').forEach((el) => {
      el.style.animationPlayState = 'paused';
      // el.style.opacity = '0'; // Wait for CSS to handle initial opacity
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <Navbar />
      <Hero />
      <OrderForm />
      <Footer />
    </div>
  );
};

import ServiceDetails from './pages/ServiceDetails'; // Import Details Page
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Website />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/services/:categoryId" element={<ServiceDetails />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
