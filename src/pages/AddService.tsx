import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useInsertData, useFetchData } from '../hooks/useSupabase'

interface Provider {
  id: number
  name: string
}

export default function AddService() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { insert, loading, error } = useInsertData('services')
  const { data: providers } = useFetchData<Provider>('providers', 'id, name')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    provider_id: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('يجب تسجيل الدخول أولاً')
      return
    }

    const dataToInsert = {
      ...formData,
      price: parseFloat(formData.price) || null,
      provider_id: parseInt(formData.provider_id),
      created_at: new Date().toISOString()
    }

    const result = await insert(dataToInsert)
    if (result) {
      alert('تم إضافة الخدمة بنجاح!')
      navigate('/')
    }
  }

  if (!user) {
    return <p>يجب تسجيل الدخول لإضافة خدمة</p>
  }

  return (
    <div className="container">
      <h1>إضافة خدمة جديدة</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>اسم الخدمة *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>المزود</label>
          <select
            name="provider_id"
            value={formData.provider_id}
            onChange={handleChange}
            required
          >
            <option value="">اختر المزود</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>السعر</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>وصف الخدمة</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'جارٍ الإضافة...' : 'إضافة الخدمة'}
        </button>
      </form>
    </div>
  )
}
