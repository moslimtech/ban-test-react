import { Link } from 'react-router-dom'
import type { Service } from '../types'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link to={`/service/${service.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={styles.card}>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        {service.price && <p style={{ fontWeight: 'bold', color: '#007bff' }}>السعر: {service.price} جنيه</p>}
        {service.providers && (
          <small style={{ color: '#666' }}>
            المزود: {service.providers.name}
            {service.providers.city && ` - ${service.providers.city}`}
          </small>
        )}
        <span style={styles.detailsLink}>عرض التفاصيل</span>
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
    cursor: 'pointer',
  },
  detailsLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
}
