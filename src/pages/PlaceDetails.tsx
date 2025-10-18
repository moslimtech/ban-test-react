import { useParams } from 'react-router-dom'
import { useFetchData } from '../hooks/useSupabase'

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
}

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>()
  const { data: provider, loading, error } = useFetchData<Provider>('providers', '*')

  if (loading) return <div className="loading"><p>جارٍ التحميل...</p></div>
  if (error) return <p className="error">خطأ: {error}</p>
  const place = provider.find(p => p.id === parseInt(id || '0'))
  if (!place) return <p>المكان غير موجود</p>

  return (
    <div className="container">
      <h1>{place.name}</h1>
      {place.image_url && (
        <img src={place.image_url} alt={place.name} style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }} />
      )}
      <p><strong>الفئة:</strong> {place.category}</p>
      <p><strong>المدينة:</strong> {place.city}</p>
      <p><strong>العنوان:</strong> {place.address}</p>
      <p><strong>الهاتف:</strong> {place.phone}</p>
      {place.website && <p><strong>الموقع:</strong> <a href={place.website} target="_blank" rel="noopener noreferrer">{place.website}</a></p>}
      {place.whatsapp && <p><strong>واتساب:</strong> {place.whatsapp}</p>}
      {place.map_url && <p><strong>الخريطة:</strong> <a href={place.map_url} target="_blank" rel="noopener noreferrer">عرض على الخريطة</a></p>}
      <p><strong>الوصف:</strong> {place.description}</p>
    </div>
  )
}
