import { useAuth } from '../hooks/useAuth'
import { useFetchData } from '../hooks/useSupabase'

interface Favorite {
  id: number
  provider_id: number
  ad_id: number
  user_id: string
}

interface Provider {
  id: number
  name: string
  category: string
}

export default function Favorites() {
  const { user } = useAuth()
  const { data: favorites, loading, error } = useFetchData<Favorite>('favorites', '*')
  const { data: providers } = useFetchData<Provider>('providers', 'id, name, category')

  if (!user) return <p>يجب تسجيل الدخول</p>
  if (loading) return <div className="loading"><p>جارٍ التحميل...</p></div>
  if (error) return <p className="error">خطأ: {error}</p>

  const userFavorites = favorites?.filter(fav => fav.user_id === user.id) || []
  const favoriteProviders = providers?.filter(provider =>
    userFavorites.some(fav => fav.provider_id === provider.id)
  ) || []

  return (
    <div className="container">
      <h1>المفضلة</h1>
      <div className="grid">
        {favoriteProviders.map(provider => (
          <div key={provider.id} className="card">
            <h3>{provider.name}</h3>
            <p>{provider.category}</p>
          </div>
        )) || <p>لا توجد مفضلة</p>}
      </div>
    </div>
  )
}
