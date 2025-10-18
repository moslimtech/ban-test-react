
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav style={styles.nav}>
      <Link to="/">الرئيسية</Link>
      {user ? (
        <>
          <Link to="/add-place">إضافة مكان</Link>
          <Link to="/add-service">إضافة خدمة</Link>
          <Link to="/profile">الملف الشخصي</Link>
          <button onClick={signOut} style={styles.btn}>تسجيل الخروج</button>
        </>
      ) : (
        <Link to="/login">تسجيل الدخول</Link>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  btn: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    fontWeight: 'bold',
    transition: 'all 0.2s ease'
  }
}
