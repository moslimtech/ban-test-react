import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import type { Activity } from '../types'

export default function AddPlace() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // جلب الفئات من قاعدة البيانات باستخدام الدالة get_categories()
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.rpc('get_categories')
      if (error) {
        console.error('Error fetching categories:', error)
      } else {
        setActivities(data || [])
      }
    }
    fetchCategories()
  }, [])
  const [formData, setFormData] = useState({
    name: '',
    activity_id: '',
    city: '',
    address: '',
    phone: '',
    website: '',
    whatsapp: '',
    map_url: '',
    description: '',
    image_url: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('User in AddPlace:', user)
    if (!user) {
      alert('يجب تسجيل الدخول أولاً')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // استدعاء الدالة add_place() من قاعدة البيانات
      const { data, error: rpcError } = await supabase.rpc('add_place', {
        p_name: formData.name,
        p_category_id: formData.activity_id || null,
        p_city: formData.city || null,
        p_address: formData.address || null,
        p_phone: formData.phone || null,
        p_website: formData.website || null,
        p_whatsapp: formData.whatsapp || null,
        p_map_link: formData.map_url || null,
        p_description: formData.description || null,
        p_image_url: formData.image_url || null
      })

      if (rpcError) {
        console.error('RPC Error:', rpcError)
        throw rpcError
      }

      console.log('RPC Result:', data)
      alert('تم إضافة المكان بنجاح!')
      navigate('/')
    } catch (err: unknown) {
      console.error('Error adding place:', err)
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <p>يجب تسجيل الدخول لإضافة مكان</p>
  }

  return (
    <div className="container">
      <h1>إضافة مكان جديد</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>اسم المكان *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>الفئة</label>
          <select
            name="activity_id"
            value={formData.activity_id}
            onChange={handleChange}
          >
            <option value="">اختر الفئة</option>
            {activities.map((activity: Activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>المدينة</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>العنوان</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>الهاتف</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>الموقع الإلكتروني</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>واتساب</label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>رابط الخريطة</label>
          <input
            type="url"
            name="map_url"
            value={formData.map_url}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>وصف المكان</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>رابط الصورة</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'جارٍ الإضافة...' : 'إضافة المكان'}
        </button>
      </form>
    </div>
  )
}
