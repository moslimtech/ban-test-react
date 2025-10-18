
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import AuthCallback from '../pages/AuthCallback'
import AddPlace from '../pages/AddPlace'
import AddService from '../pages/AddService'
import PlaceDetails from '../pages/PlaceDetails'
import ServiceDetails from '../pages/ServiceDetails'
import Offers from '../pages/Offers'
import Favorites from '../pages/Favorites'
import Profile from '../pages/Profile'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/add-place" element={<AddPlace />} />
      <Route path="/add-service" element={<AddService />} />
      <Route path="/place/:id" element={<PlaceDetails />} />
      <Route path="/service/:id" element={<ServiceDetails />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/places" element={<Home />} />
      <Route path="/services" element={<Home />} />
      <Route path="/ads" element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
