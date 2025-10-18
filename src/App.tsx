
import { AuthProvider } from './components/AuthProvider'
import AppRoutes from './routes/AppRoutes'
import './styles/global.css'

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
