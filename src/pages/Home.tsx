import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PlaceCard from '../components/PlaceCard'
import ServiceCard from '../components/ServiceCard'
import Navbar from '../components/Navbar'
import { Link } from 'react-router-dom'
import type { Provider, Service, Ad } from '../types'

export default function Home() {
  // State
  const [providers, setProviders] = useState<Provider[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'places' | 'services' | 'ads'>('all')

  const ranOnce = useRef(false) // لمنع التكرار في وضع التطوير StrictMode
  const adFallbackImage = 'https://placehold.co/600x400?text=No+Image'

  // Fetch data on mount
  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true

    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        // لا ننتظر الجلسة؛ نسجلها فقط إذا توفرت (لا تمنع الجلب)
        supabase.auth.getSession().catch(() => {})

        // 1) Providers - استخدام دالة get_providers()
        const { data: providersData, error: providersError } = await supabase.rpc('get_providers')
        if (providersError) {
          console.error('Error fetching providers:', providersError)
          // Fallback to direct query if RPC fails
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('providers')
            .select('id, name, category, city, image_url, description')
            .limit(12)
          if (fallbackError) throw fallbackError
          setProviders(fallbackData || [])
        } else {
          setProviders(providersData || [])
        }

        // 2) Services - استخدام دالة get_services()
        const { data: servicesData, error: servicesError } = await supabase.rpc('get_services')
        if (servicesError) {
          console.error('Error fetching services:', servicesError)
          // Fallback to direct query if RPC fails
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('services')
            .select('id, provider_id, name, description, price, image_url, delivery, online')
            .limit(12)
          if (fallbackError) throw fallbackError
          setServices(fallbackData || [])
        } else {
          setServices(servicesData || [])
        }

        // 3) Ads (بدون دمج مزودين)
        const { data: adsData, error: adsError } = await supabase
          .from('ads')
          .select('id, title, description, provider_id, status, ads_images(image_url)')
          .eq('status', 'active')
          .limit(12)
        if (adsError) throw adsError

        // 4) Link ads images via separate query
        let adsWithImages: Ad[] = (adsData || []) as unknown as Ad[]
        if (adsWithImages.length > 0) {
          const adIds = adsWithImages.map(a => a.id)
          const { data: imagesData, error: imagesError } = await supabase
            .from('ads_images')
            .select('ad_id, image_url')
            .in('ad_id', adIds)
          if (imagesError) throw imagesError

          const byAd: Record<number, { image_url: string }[]> = {}
          ;(imagesData || []).forEach((img: { ad_id: number; image_url: string }) => {
            const key = img.ad_id
            if (!byAd[key]) byAd[key] = []
            byAd[key].push({ image_url: img.image_url })
          })

          adsWithImages = adsWithImages.map(ad => ({
            ...ad,
            ads_images: byAd[ad.id] || []
          }))
        } else {
          adsWithImages = []
        }

        setProviders(providersData || [])
        setServices(servicesData || [])
        setAds(adsWithImages)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  // UI helpers
  const renderAdsCard = (ad: Ad) => (
    <div key={ad.id} style={styles.adCard}>
      <img
        src={ad.ads_images?.[0]?.image_url || adFallbackImage}
        alt={ad.title}
        style={styles.adImage}
        onError={(e) => { e.currentTarget.src = adFallbackImage }}
      />
      <h3>{ad.title}</h3>
      {ad.description && <p>{ad.description}</p>}
    </div>
  )

  const renderContent = () => {
    if (loading) return <div style={styles.loading}>جارٍ التحميل...</div>
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>حدث خطأ: {error}</p>

    switch (activeTab) {
      case 'places':
        return (
          <div style={styles.grid}>
            {providers.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%' }}>لا توجد أماكن متاحة حاليًا.</p>
            ) : (
              providers.map(p => <PlaceCard key={p.id} provider={p} />)
            )}
          </div>
        )
      case 'services':
        return (
          <div style={styles.grid}>
            {services.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%' }}>لا توجد خدمات متاحة حاليًا.</p>
            ) : (
              services.map(s => <ServiceCard key={s.id} service={s} />)
            )}
          </div>
        )
      case 'ads':
        return (
          <div style={styles.grid}>
            {ads.length === 0 ? (
              <p style={{ textAlign: 'center', width: '100%' }}>لا توجد إعلانات متاحة حاليًا.</p>
            ) : (
              ads.map(renderAdsCard)
            )}
          </div>
        )
      default:
        return (
          <>
            {/* Featured Places */}
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2>الأماكن المميزة</h2>
                <Link to="/places" style={styles.viewAllLink}>عرض الكل</Link>
              </div>
              <div style={styles.grid}>
                {providers.slice(0, 6).map(p => <PlaceCard key={p.id} provider={p} />)}
              </div>
            </section>

            {/* Featured Services */}
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2>ال��دمات المميزة</h2>
                <Link to="/services" style={styles.viewAllLink}>عرض الكل</Link>
              </div>
              <div style={styles.grid}>
                {services.slice(0, 6).map(s => <ServiceCard key={s.id} service={s} />)}
              </div>
            </section>

            {/* Ads */}
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2>الإعلانات</h2>
                <Link to="/ads" style={styles.viewAllLink}>عرض الكل</Link>
              </div>
              <div style={styles.grid}>
                {ads.slice(0, 6).map(renderAdsCard)}
              </div>
            </section>
          </>
        )
    }
  }

  return (
    <div style={styles.container}>
      <Navbar />

      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>اكتشف الأماكن والخدمات في مدينتك</h1>
        <p style={styles.heroSubtitle}>منصة شاملة للأعمال والخدمات المحلية</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === 'all' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('all')}
        >
          الكل
        </button>
        <button
          style={activeTab === 'places' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('places')}
        >
          الأماكن
        </button>
        <button
          style={activeTab === 'services' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('services')}
        >
          الخدمات
        </button>
        <button
          style={activeTab === 'ads' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('ads')}
        >
          الإعلانات
        </button>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}

// Styles
const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem',
  },
  grid: {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '1.2rem',
  },
  hero: {
    textAlign: 'center' as const,
    padding: '3rem 1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '10px',
    marginBottom: '2rem',
  },
  heroTitle: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },
  tab: {
    padding: '0.5rem 1rem',
    border: '2px solid #007bff',
    background: 'white',
    color: '#007bff',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
  },
  activeTab: {
    background: '#007bff',
    color: 'white',
  },
  section: {
    marginBottom: '3rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  viewAllLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  adCard: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    padding: '1rem',
    textAlign: 'center' as const,
    transition: 'transform 0.2s',
  },
  adImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover' as const,
    borderRadius: '5px',
    marginBottom: '1rem',
    backgroundColor: '#f3f4f6',
  },
} as const
