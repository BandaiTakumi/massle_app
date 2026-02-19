import './Footer.css'
import { Link, useLocation } from 'react-router-dom'

function Footer() {
  const location = useLocation()

  return (
    <footer className="footer">
      <Link 
        to="/calender" 
        className={`footer-button ${location.pathname === '/calender' ? 'active' : ''}`}
      >
        <span>📅</span>
        <span>過去のトレーニング</span>
      </Link>
      <Link 
        to="/" 
        className={`footer-button ${location.pathname === '/' ? 'active' : ''}`}
      >
        <span>🏋️</span>
        <span>メニュー登録</span>
      </Link>
      <Link 
        to="/training" 
        className={`footer-button ${location.pathname === '/training' ? 'active' : ''}`}
      >
        <span>💪</span>
        <span>トレーニング</span>
      </Link>
      <Link 
        to="/wight" 
        className={`footer-button ${location.pathname === '/wight' ? 'active' : ''}`}
      >
        <span>⚖️</span>
        <span>体重管理</span>
      </Link>
    </footer>
  )
}

export default Footer
