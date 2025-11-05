import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ServiceCard from '../components/ServiceCard'
import type { Service } from '../types'
import { useFetchData } from '../hooks/useSupabase'
import { useAuth } from '../hooks/useAuth'

interface Provider {
  id: number
  name: string
  category: string
  city: string
  address: string
  phone: string
  website: string
  whatsapp: string
  map_url: string
  description: string
  image_url: string
  user_id?: string
}

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: provider, loading, error } = useFetchData<Provider>('providers', '*')
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<'latest' | 'price_asc' | 'price_desc'>('latest')
  const [filterBy, setFilterBy] = useState<'all' | 'delivery' | 'online'>('all')

  // سجل زيارة الصفحة
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const page = `/place/${id}`
        await supabase.rpc('record_visit', { p_page: page })
        // حدّث عداد الجلسة لعرضه في الهيدر
        try {
          const raw = sessionStorage.getItem('session_pages') || '[]'
          const arr = JSON.parse(raw) as string[]
          if (!arr.includes(page)) {
            arr.push(page)
            sessionStorage.setItem('session_pages', JSON.stringify(arr))
          }
          window.dispatchEvent(new Event('data-refresh'))
        } catch (_) {}
      } catch (_) {
        // ignore
      }
    })()
  }, [id])

  // جلب خدمات المكان
  useEffect(() => {
    const pid = parseInt(id || '0')
    if (!pid) return
    ;(async () => {
      try {
        setServicesLoading(true)
        const { data, error } = await supabase
          .from('services')
          .select('id, provider_id, name, description, price, image_url, delivery, online')
          .eq('provider_id', pid)
          .order('created_at', { ascending: false })
        if (!error && data) setServices(data as Service[])
      } finally {
        setServicesLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div className="loading"><p>جارٍ التحميل...</p></div>
  if (error) return <p className="error">خطأ: {error}</p>
  const place = provider.find(p => p.id === parseInt(id || '0'))
  if (!place) return <p>المكان غير موجود</p>

  const isOwner = user && provider.find(p => p.id === parseInt(id || '0'))?.user_id === user.id

  return (
    <div className="container" style={styles.mainContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>{place.name}</h1>
        {isOwner && (
          <button 
            onClick={() => navigate(`/edit-place/${id}`)}
            style={styles.editButton}
          >
            ✏️ تعديل
          </button>
        )}
      </div>

      {place.image_url && (
        <div style={styles.imageContainer}>
          <img 
            src={place.image_url} 
            alt={place.name} 
            style={styles.image} 
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image' }}
          />
        </div>
      )}

      <div style={styles.detailsGrid}>
        <div style={styles.detailCard}>
          <span style={styles.icon}>🏷️</span>
          <div>
            <strong style={styles.label}>الفئة:</strong>
            <p style={styles.value}>{place.category}</p>
          </div>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.icon}>📍</span>
          <div>
            <strong style={styles.label}>المدينة:</strong>
            <p style={styles.value}>{place.city}</p>
          </div>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.icon}>📍</span>
          <div>
            <strong style={styles.label}>العنوان:</strong>
            <p style={styles.value}>{place.address}</p>
          </div>
        </div>

        <div style={styles.detailCard}>
          <span style={styles.icon}>📞</span>
          <div>
            <strong style={styles.label}>الهاتف:</strong>
            <a href={`tel:${place.phone}`} style={{ ...styles.value, ...styles.link }}>{place.phone}</a>
          </div>
        </div>

        {place.website && (
          <div style={styles.detailCard}>
            <span style={styles.icon}>🌐</span>
            <div>
              <strong style={styles.label}>الموقع:</strong>
              <p style={styles.value}>
                <a href={place.website} target="_blank" rel="noopener noreferrer" style={styles.link}>{place.website}</a>
              </p>
            </div>
          </div>
        )}

        {place.whatsapp && (
          <div style={styles.detailCard}>
            <span style={styles.icon}>💬</span>
            <div>
              <strong style={styles.label}>واتساب:</strong>
              <p style={styles.value}>{place.whatsapp}</p>
            </div>
          </div>
        )}

        {place.map_url && (
          <div style={styles.detailCard}>
            <span style={styles.icon}>🗺️</span>
            <div>
              <strong style={styles.label}>الخريطة:</strong>
              <p style={styles.value}>
                <a href={place.map_url} target="_blank" rel="noopener noreferrer" style={styles.link}>عرض على الخريطة</a>
              </p>
            </div>
          </div>
        )}

        <div style={styles.descriptionCard}>
          <span style={styles.icon}>📝</span>
          <div style={styles.descriptionContent}>
            <strong style={styles.label}>الوصف:</strong>
            <p style={styles.description}>{place.description}</p>
          </div>
        </div>
      </div>

      {/* الخدمات التابعة للمكان */}
      <div style={styles.servicesSection}>
        <div style={styles.servicesHeader}>
          <h2 style={styles.sectionTitle}>الخدمات ({services.length})</h2>
          <div style={styles.filtersContainer}>
            <label style={styles.filterLabel}>ترتيب:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={styles.select}>
              <option value="latest">الأحدث</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
            </select>
            <label style={styles.filterLabel}>فلتر:</label>
            <select value={filterBy} onChange={e => setFilterBy(e.target.value as any)} style={styles.select}>
              <option value="all">الكل</option>
              <option value="delivery">التوصيل فقط</option>
              <option value="online">أونلاين فقط</option>
            </select>
          </div>
        </div>

        {servicesLoading ? (
          <p style={styles.loadingText}>جارٍ تحميل الخدمات...</p>
        ) : (() => {
          let list = [...services]
          if (filterBy === 'delivery') list = list.filter(s => !!s.delivery)
          if (filterBy === 'online') list = list.filter(s => !!s.online)
          if (sortBy === 'price_asc') list.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)))
          if (sortBy === 'price_desc') list.sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)))
          // latest: يُحافظ على ترتيب الجلب (الأحدث أولاً)
          return list.length === 0 ? (
            <p style={styles.noServices}>لا توجد خدمات بهذه المعايير.</p>
          ) : (
            <div style={styles.servicesGrid}>
              {list.map(s => (
                <div key={s.id} style={styles.serviceItem}>
                  {typeof s.price === 'number' && (
                    <span style={styles.priceBadge}>
                      {s.price} ج.م
                    </span>
                  )}
                  <ServiceCard service={s} />
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

const styles = {
  mainContainer: {
    background: 'linear-gradient(180deg, #121933, #1b2445)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    marginBottom: '2rem',
  } as const,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  } as const,
  title: {
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  } as const,
  editButton: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  } as const,
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  } as const,
  image: {
    width: '100%',
    maxWidth: '400px',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '3px solid rgba(255,255,255,0.2)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
  } as const,
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  } as const,
  detailCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  } as const,
  descriptionCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
    gridColumn: '1 / -1' as const,
  } as const,
  icon: {
    fontSize: '1.5rem',
    minWidth: '30px',
  } as const,
  label: {
    color: '#5b7cfa',
    fontSize: '0.9rem',
    display: 'block',
    marginBottom: '0.25rem',
  } as const,
  value: {
    color: 'white',
    margin: 0,
    fontSize: '1rem',
  } as const,
  description: {
    color: '#ddd',
    margin: 0,
    lineHeight: 1.5,
    fontSize: '0.95rem',
  } as const,
  descriptionContent: {
    flex: 1,
  } as const,
  link: {
    color: '#5b7cfa',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  } as const,
  servicesSection: {
    marginTop: '2rem',
  } as const,
  servicesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  } as const,
  sectionTitle: {
    color: 'white',
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
  } as const,
  filtersContainer: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  } as const,
  filterLabel: {
    color: '#ccc',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  } as const,
  select: {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  } as const,
  servicesGrid: {
    display: 'grid',
    gap: '1.5rem',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  } as const,
  serviceItem: {
    position: 'relative' as const,
  } as const,
  priceBadge: {
    position: 'absolute' as const,
    top: '8px',
    left: '8px',
    background: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffeeba',
    borderRadius: '12px',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    zIndex: 1 as const,
  } as const,
  loadingText: {
    color: '#ccc',
    textAlign: 'center' as const,
    fontSize: '1.1rem',
  } as const,
  noServices: {
    color: '#ccc',
    textAlign: 'center' as const,
    fontSize: '1.1rem',
  } as const,
} as const
