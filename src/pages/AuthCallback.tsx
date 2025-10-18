import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('جارٍ معالجة تسجيل الدخول...')

  useEffect(() => {
    console.log('🔄 AuthCallback loaded, current URL:', window.location.href)
    setStatus('جارٍ إكمال تسجيل الدخول...')

    let handled = false
    const cleanUrl = () => window.history.replaceState({}, document.title, window.location.pathname)

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 AuthCallback auth state:', event, session?.user?.id || 'none')
      if (event === 'SIGNED_IN' && !handled) {
        handled = true
        setStatus('✅ تم تسجيل الدخول، جارٍ التحويل...')
        cleanUrl()
        navigate('/')
      }
    })

    ;(async () => {
      try {
        const href = window.location.href
        const hasCode = window.location.search.includes('code=')
        const hasAccessToken = window.location.hash.includes('access_token=')

        if (hasCode) {
          // PKCE flow
          await supabase.auth.exchangeCodeForSession?.(href)
          handled = true
          cleanUrl()
          navigate('/')
          return
        }

        if (hasAccessToken) {
          // Implicit/hybrid flow: parse tokens from URL hash and set session manually
          const params = new URLSearchParams(window.location.hash.substring(1))
          const access_token = params.get('access_token') || ''
          const refresh_token = params.get('refresh_token') || ''
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) throw error
            handled = true
            cleanUrl()
            navigate('/')
            return
          }
        }
      } catch (e) {
        console.error('AuthCallback: error handling callback URL', e)
        setStatus('حدث خطأ أثناء معالجة تسجيل الدخول')
      }
    })()

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [navigate])

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>{status}</h2>
      <p>يرجى الانتظار...</p>
    </div>
  )
}
