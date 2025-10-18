import { useAuth } from '../hooks/useAuth'
import { useFetchData } from '../hooks/useSupabase'
import type { Provider, Service, Ad } from '../types'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { data: providers, loading: providersLoading, error: providersError } = useFetchData<Provider>('providers', 'id, name, category, city, user_id')
  const { data: services, loading: servicesLoading, error: servicesError } = useFetchData<Service>('services', 'id, name, description, price, provider_id')
  const { data: ads, loading: adsLoading, error: adsError } = useFetchData<Ad>('ads', 'id, title, description, provider_id, status')

  if (!user) {
    return <p>يجب تسجيل الدخول</p>
  }

  const userProviders = providers?.filter(provider => provider.user_id === user.id) || []
  const userServices = services?.filter(service => userProviders.some(provider => provider.id === service.provider_id)) || []
  const userAds = ads?.filter(ad => userProviders.some(provider => provider.id === ad.provider_id)) || []

  return (
    <div style={styles.container}>
      <h1>الملف الشخصي</h1>
      <div style={styles.userInfo}>
        <p><strong>الاسم:</strong> {user.full_name}</p>
        <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
        <button onClick={signOut} style={styles.signOutButton}>تسجيل الخروج</button>
      </div>

      <h2>أماكني ({userProviders.length})</h2>
      {providersLoading && <p>جارٍ التحميل...</p>}
      {providersError && <p style={styles.error}>{providersError}</p>}
      <div style={styles.grid}>
        {userProviders.map(provider => (
          <div key={provider.id} style={styles.card}>
            <h3>{provider.name}</h3>
            <p><strong>الفئة:</strong> {provider.category}</p>
            <p><strong>المدينة:</strong> {provider.city}</p>
          </div>
        ))}
      </div>

      <h2>خدماتي ({userServices.length})</h2>
      {servicesLoading && <p>جارٍ التحميل...</p>}
      {servicesError && <p style={styles.error}>{servicesError}</p>}
      <div style={styles.grid}>
        {userServices.map(service => (
          <div key={service.id} style={styles.card}>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <p><strong>السعر:</strong> {service.price} جنيه</p>
          </div>
        ))}
      </div>

      <h2>إعلاناتي ({userAds.length})</h2>
      {adsLoading && <p>جارٍ التحميل...</p>}
      {adsError && <p style={styles.error}>{adsError}</p>}
      <div style={styles.grid}>
        {userAds.map(ad => (
          <div key={ad.id} style={styles.card}>
            <h3>{ad.title}</h3>
            <p>{ad.description}</p>
            <p><strong>الحالة:</strong> {ad.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
  },
  userInfo: {
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  signOutButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  error: {
    color: '#dc3545',
    background: '#f8d7da',
    padding: '0.5rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
}
