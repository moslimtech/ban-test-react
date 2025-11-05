import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <span style={styles.text}>Muslim Tech _ مسلم تيك</span>
        <a href="https://wa.me/201558905023" style={styles.link} target="_blank" rel="noopener noreferrer">
          01558905023
        </a>
        <span style={styles.text}>م\ احمد م\ ابراهيم</span>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26,26,26,0.8)',
    backdropFilter: 'blur(10px)',
    color: '#ffffff',
    padding: '10px 20px',
    textAlign: 'center' as const,
    fontSize: '14px',
    zIndex: 40,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap' as const,
  },
  text: {
    color: '#ffffff',
    fontWeight: 500 as const,
  },
  link: {
    color: '#25D366',
    textDecoration: 'none',
    fontWeight: 600 as const,
    transition: 'color 0.2s',
  },
} as const;
