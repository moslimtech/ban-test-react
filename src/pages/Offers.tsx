import { useFetchData } from '../hooks/useSupabase'

interface Offer {
  id: number
  title: string
  description: string
  price: number
  provider_id: number
}

export default function Offers() {
  const { data: offers, loading, error } = useFetchData<Offer>('offers', '*')

  if (loading) return <div className="loading"><p>جارٍ التحميل...</p></div>
  if (error) return <p className="error">خطأ: {error}</p>

  return (
    <div className="container">
      <h1>العروض</h1>
      <div className="grid">
        {offers?.map(offer => (
          <div key={offer.id} className="card">
            <h3>{offer.title}</h3>
            <p>{offer.description}</p>
            <p>السعر: {offer.price}</p>
          </div>
        )) || <p>لا توجد عروض</p>}
      </div>
    </div>
  )
}
