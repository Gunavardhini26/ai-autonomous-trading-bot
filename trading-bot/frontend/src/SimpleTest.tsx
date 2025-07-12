import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1f2937',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#374151',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#e11d48'
        }}>
          🚀 AI Trading Bot
        </h1>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
          React is working! This is a test component.
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: '#1f2937',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '0.875rem' }}>
            ✅ React rendering: SUCCESS<br/>
            ✅ JavaScript: WORKING<br/>
            ✅ CSS: APPLIED<br/>
          </p>
        </div>
        <button style={{
          backgroundColor: '#e11d48',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }} onClick={() => alert('Button works!')}>
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SimpleTest;
