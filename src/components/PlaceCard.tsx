import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Provider } from '../types'

// src/components/PlaceCard.tsx

export default function PlaceCard({ provider, stats }: { provider: Provider; stats?: { total_visits?: number; today_visits?: number } }) {
  const placeholder = 'https://placehold.co/600x400?text=No+Image'
  const [imgSrc, setImgSrc] = useState<string>(provider.image_url || placeholder)

  useEffect(() => {
    setImgSrc(provider.image_url || placeholder)
  }, [provider.image_url])

  const handleImgError = async () => {
    const url: string | undefined = provider.image_url
    if (url && /\bibb\.co\b/.test(url)) {
      // استخدم لقطة شاشة للصفحة كحل بديل لتفادي CORS
      const screenshot = `https://image.thum.io/get/width/800/noanimate/${encodeURIComponent(url)}`
      setImgSrc(screenshot)
      return
    }
    setImgSrc(placeholder)
  }

  const handleImageLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (provider.image_url) {
      window.open(provider.image_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div style={styles.cardContainer}>
      <Link to={`/place/${provider.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card" style={styles.card}>
          <div style={styles.imageFrame}>
            <img
              src={imgSrc}
              alt={provider.name}
              style={styles.image}
              referrerPolicy="no-referrer"
              decoding="async"
              onError={handleImgError}
            />
          </div>
          <div style={styles.content}>
            <h3 style={styles.name}>{provider.name}</h3>
            <div style={styles.details}>
              <p style={styles.category}>{provider.category}</p>
              <p style={styles.city}>{provider.city}</p>
            </div>
            {provider.description && <small style={styles.description}>{provider.description}</small>}
            <div style={styles.badge}>
              <span>👁️ {stats?.today_visits ?? 0}</span>
              <span> — 📊 {stats?.total_visits ?? 0}</span>
            </div>
          </div>
        </div>
      </Link>
      {provider.image_url && (
        <button
          onClick={handleImageLinkClick}
          style={styles.imageButton}
        >
          عرض الصورة
        </button>
      )}
    </div>
  )
}

const styles = {
  cardContainer: {
    position: 'relative' as const,
  },
  card: {
    background: 'linear-gradient(180deg, #121933, #1b2445)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '1rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  },
  imageFrame: {
    border: '3px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '0.5rem',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  image: {
    width: '100%',
    height: '160px',
    objectFit: 'cover' as const,
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  name: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  details: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: '#5b7cfa',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    margin: 0,
  },
  city: {
    color: '#ccc',
    fontSize: '0.8rem',
    margin: 0,
  },
  description: {
    color: '#ddd',
    fontSize: '0.85rem',
    lineHeight: 1.4,
  },
  badge: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '15px',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    color: '#f5f7ff',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  imageButton: {
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
