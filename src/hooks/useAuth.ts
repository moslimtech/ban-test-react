import { createContext, useContext } from 'react'
import type { AuthContextType } from '../types'

// 🔹 إنشاء السياق
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

// 🔹 هوك مساعد للوصول بسهولة إلى المستخدم
export const useAuth = () => {
  return useContext(AuthContext)
}
