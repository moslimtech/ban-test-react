import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Provider } from '../types'

// src/components/PlaceCard.tsx

export default function PlaceCard({ provider }: { provider: Provider }) {
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

  return (
    <Link to={`/place/${provider.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={styles.card}>
        <img
          src={imgSrc}
          alt={provider.name}
          style={styles.image}
          referrerPolicy="no-referrer"
          decoding="async"
          onError={handleImgError}
        />
        {provider.image_url && (
          <a
            href={provider.image_url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.imageLink}
            onClick={(e) => e.stopPropagation()}
          >عرض الصورة</a>
        )}
        <h3>{provider.name}</h3>
        <p>{provider.category}</p>
        <p style={styles.city}>{provider.city}</p>
        {provider.description && <small>{provider.description}</small>}
      </div>
    </Link>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    padding: '1rem',
    textAlign: 'center' as const,
    transition: '0.2s',
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover' as const,
    borderRadius: '6px',
    marginBottom: '0.5rem',
    backgroundColor: '#f3f4f6',
  },
  city: { color: '#666', fontSize: '0.9rem' },
  imageLink: {
    display: 'inline-block',
    marginTop: '0.25rem',
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 'bold' as const,
  },
}