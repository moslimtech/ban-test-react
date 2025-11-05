import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFetchData } from '../hooks/useSupabase'
import { supabase } from '../lib/supabaseClient'
import ImageUploader from '../components/ImageUploader'
import type { Provider, Service, Ad } from '../types'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { data: providers, loading: providersLoading, error: providersError } = useFetchData<Provider>('providers', 'id, name, category, city, image_url, description, user_id')
  const { data: services, loading: servicesLoading, error: servicesError } = useFetchData<Service>('services', 'id, name, description, price, image_url, provider_id')
  const { data: ads, loading: adsLoading, error: adsError } = useFetchData<Ad>('ads', 'id, title, description, provider_id, status')
  const [pkgInfo, setPkgInfo] = useState<any>(null)
  const [pkgLoading, setPkgLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      setPkgLoading(true)
      const { data, error } = await supabase.rpc('get_user_package', { p_user_id: user.id })
      if (mounted && Array.isArray(data) && data.length) setPkgInfo(data[0])
      setPkgLoading(false)
    })()
    return () => { mounted = false }
  }, [user?.id])

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [serviceForm, setServiceForm] = useState<{ name: string; description: string; price: string; image_url: string } | null>(null)

  if (!user) {
    return <p>يجب تسجيل الدخول</p>
  }

  const userProviders = providers?.filter(provider => provider.user_id === user.id) || []
  const userServices = services?.filter(service => userProviders.some(provider => provider.id === service.provider_id)) || []
  const userAds = ads?.filter(ad => userProviders.some(provider => provider.id === ad.provider_id)) || []

      <div className="profile-header">
        <h1>الملف الشخصي</h1>
      </div>
      <div className="profile-user-info">
        <p><strong>الاسم:</strong> {user.full_name}</p>
        <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
        <button onClick={signOut} className="profile-sign-out-btn">تسجيل الخروج</button>
      </div>

      {/* تبويب الباقات والخطط */}
      <div className="profile-section">
        <h2>الباقات والخطط</h2>
        <div className="card">
          {pkgLoading ? <p>جارٍ التحميل...</p> : pkgInfo && pkgInfo.is_active ? (
            <>
              <p><strong>باقتك الحالية:</strong> {pkgInfo.package_name || 'مجانية' }</p>
              <p><strong>تاريخ بدء الاشتراك:</strong> {pkgInfo.started_at ? new Date(pkgInfo.started_at).toLocaleDateString() : 'غير محدد'}</p>
              <p><strong>تاريخ الانتهاء:</strong> {pkgInfo.expires_at ? new Date(pkgInfo.expires_at).toLocaleDateString() : 'غير محدد'}</p>
              <button className="profile-btn profile-btn-primary" onClick={()=>navigate('/packages')}>ترقية أو تغيير الباقة</button>
            </>
          ) : (
            <>
              <p>أنت على الباقة المجانية (Free tier).</p>
              <button className="profile-btn profile-btn-primary" onClick={()=>navigate('/packages')}>اشترك في باقة أفضل</button>
            </>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2>أماكني ({userProviders.length})</h2>
        {providersLoading && <p>جارٍ التحميل...</p>}
        {providersError && <p className="error">{providersError}</p>}
        <div className="grid">
          {userProviders.map(provider => (
            <button key={provider.id} className="profile-card-button" onClick={() => setSelectedProvider(provider)}>
              {provider.image_url && (
                <img
                  src={provider.image_url}
                  alt={provider.name}
                  className="profile-avatar"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement
                    t.onerror = null
                    t.src = 'https://placehold.co/200x200?text=No+Image'
                  }}
                />
              )}
              <h3>{provider.name}</h3>
              <p><strong>الفئة:</strong> {provider.category}</p>
              <p><strong>المدينة:</strong> {provider.city}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h2>خدماتي ({userServices.length})</h2>
        {servicesLoading && <p>جارٍ التحميل...</p>}
        {servicesError && <p className="error">{servicesError}</p>}
        <div className="grid">
          {userServices.map(service => (
            <button key={service.id} className="profile-card-button" onClick={() => setSelectedService(service)}>
              {service.image_url && (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="profile-avatar"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement
                    t.onerror = null
                    t.src = 'https://placehold.co/200x200?text=No+Image'
                  }}
                />
              )}
              <h3>{service.name}</h3>
              <p style={{ minHeight: 40 }}>{service.description}</p>
              {typeof service.price === 'number' && <p><strong>السعر:</strong> {service.price} جنيه</p>}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h2>إعلاناتي ({userAds.length})</h2>
        {adsLoading && <p>جارٍ التحميل...</p>}
        {adsError && <p className="error">{adsError}</p>}
        <div className="grid">
          {userAds.map(ad => (
            <div key={ad.id} className="card">
              <h3>{ad.title}</h3>
              <p>{ad.description}</p>
              <p><strong>الحالة:</strong> {ad.status}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Provider Modal */}
      {selectedProvider && (
        <div className="profile-modal-overlay" onClick={() => !actionLoading && setSelectedProvider(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedProvider.name}</h3>
            {selectedProvider.image_url && (
              <img src={selectedProvider.image_url} alt={selectedProvider.name} className="profile-modal-image" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = 'https://placehold.co/400x300?text=No+Image' }} />
            )}
            {selectedProvider.description && <p>{selectedProvider.description}</p>}
            <div className="profile-actions">
              <button onClick={() => navigate(`/place/${selectedProvider.id}`)} disabled={actionLoading} className="profile-btn profile-btn-secondary">فتح التفاصيل</button>
              <button onClick={() => navigate(`/edit-place/${selectedProvider.id}`)} disabled={actionLoading} className="profile-btn profile-btn-primary">تعديل المكان</button>
              <button
                onClick={async () => {
                  if (!confirm('هل أنت متأكد من حذف هذا المكان؟ سيؤدي ذلك إلى إزالته من القوائم.')) return
                  try {
                    setActionLoading(true)
                    const { error } = await supabase.rpc('delete_provider', { p_id: selectedProvider.id, p_user_id: user.id })
                    if (error) throw error
                    setSelectedProvider(null)
                    // تحديث بسيط: إعادة تحميل الصفحة أو يمكن تحسينه بحذف العنصر محليًا
                    window.dispatchEvent(new Event('data-refresh'))
                  } catch (err) {
                    alert('فشل حذف المكان')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading}
                className="profile-btn profile-btn-danger"
              >
                حذف المكان
              </button>
              <button onClick={() => setSelectedProvider(null)} disabled={actionLoading} className="profile-btn profile-btn-secondary">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {selectedService && (
        <div className="profile-modal-overlay" onClick={() => !actionLoading && setSelectedService(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedService.name}</h3>
            {(serviceForm?.image_url || selectedService.image_url) && (
              <img src={serviceForm?.image_url || selectedService.image_url!} alt={selectedService.name} className="profile-modal-image" onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = 'https://placehold.co/400x300?text=No+Image' }} />
            )}
            <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label>
                اسم الخدمة
                <input
                  type="text"
                  value={serviceForm?.name ?? selectedService.name}
                  onChange={(e) => setServiceForm(prev => ({
                    name: e.target.value,
                    description: prev?.description ?? (selectedService.description || ''),
                    price: prev?.price ?? (typeof selectedService.price === 'number' ? String(selectedService.price) : ''),
                    image_url: prev?.image_url ?? (selectedService.image_url || '')
                  }))}
                />
              </label>
              <label>
                وصف الخدمة
                <textarea
                  rows={3}
                  value={serviceForm?.description ?? (selectedService.description || '')}
                  onChange={(e) => setServiceForm(prev => ({
                    name: prev?.name ?? selectedService.name,
                    description: e.target.value,
                    price: prev?.price ?? (typeof selectedService.price === 'number' ? String(selectedService.price) : ''),
                    image_url: prev?.image_url ?? (selectedService.image_url || '')
                  }))}
                />
              </label>
              <label>
                السعر
                <input
                  type="number"
                  step="0.01"
                  value={serviceForm?.price ?? (typeof selectedService.price === 'number' ? String(selectedService.price) : '')}
                  onChange={(e) => setServiceForm(prev => ({
                    name: prev?.name ?? selectedService.name,
                    description: prev?.description ?? (selectedService.description || ''),
                    price: e.target.value,
                    image_url: prev?.image_url ?? (selectedService.image_url || '')
                  }))}
                />
              </label>
              <div>
                <ImageUploader
                  label="صورة الخدمة"
                  currentImageUrl={serviceForm?.image_url || selectedService.image_url || ''}
                  onUploadSuccess={(imageUrl) => setServiceForm(prev => ({
                    name: prev?.name ?? selectedService.name,
                    description: prev?.description ?? (selectedService.description || ''),
                    price: prev?.price ?? (typeof selectedService.price === 'number' ? String(selectedService.price) : ''),
                    image_url: imageUrl
                  }))}
                />
              </div>
            </div>
            <div className="profile-actions">
              <button onClick={() => navigate(`/service/${selectedService.id}`)} disabled={actionLoading} className="profile-btn profile-btn-secondary">فتح التفاصيل</button>
              <button
                onClick={async () => {
                  try {
                    setActionLoading(true)
                    const payload = {
                      p_id: selectedService.id,
                      p_name: serviceForm?.name ?? selectedService.name,
                      p_description: serviceForm?.description ?? selectedService.description ?? null,
                      p_price: serviceForm?.price ? parseFloat(serviceForm.price) : selectedService.price ?? null,
                      p_image_url: serviceForm?.image_url ?? selectedService.image_url ?? null
                    }
                    const { error } = await supabase.rpc('update_service', payload as any)
                    if (error) throw error
                    setSelectedService(null)
                    setServiceForm(null)
                    window.dispatchEvent(new Event('data-refresh'))
                  } catch (err) {
                    alert('فشل حفظ التعديلات')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading}
                className="profile-btn profile-btn-primary"
              >
                حفظ التعديلات
              </button>
              <button
                onClick={async () => {
                  if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return
                  try {
                    setActionLoading(true)
                    const { error } = await supabase.rpc('delete_service', { p_id: selectedService.id })
                    if (error) throw error
                    setSelectedService(null)
                    setServiceForm(null)
                    window.dispatchEvent(new Event('data-refresh'))
                  } catch (err) {
                    alert('فشل حذف الخدمة')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading}
                className="profile-btn profile-btn-danger"
              >
                حذف الخدمة
              </button>
              <button onClick={() => { setSelectedService(null); setServiceForm(null) }} disabled={actionLoading} className="profile-btn profile-btn-secondary">إغلاق</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}


