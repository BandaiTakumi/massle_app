import './Footer.css'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Footer() {
  const location = useLocation()
  const [hasTraining, setHasTraining] = useState(false)

  useEffect(() => {
    // localStorageからトレーニングの有無を確認
    const trainingFlag = localStorage.getItem('hasTraining')
    setHasTraining(trainingFlag === 'true')
  }, [location])

  return (
    <footer className="footer">
      <Link 
        to="/calender" 
        className={`footer-button ${location.pathname === '/calender' ? 'active' : ''}`}
      >
        <span>📅</span>
        <span>カレンダー</span>
      </Link>
      <Link 
        to="/" 
        className={`footer-button ${location.pathname === '/' ? 'active' : ''}`}
      >
        <span>🏋️</span>
        <span>メニュー登録</span>
      </Link>
      {hasTraining && (
        <Link 
          to="/training" 
          className={`footer-button ${location.pathname === '/training' ? 'active' : ''}`}
        >
          <span>💪</span>
          <span>トレーニング</span>
        </Link>
      )}
      <Link 
        to="/wight" 
        className={`footer-button ${location.pathname === '/wight' ? 'active' : ''}`}
      >
        <span>⚖️</span>
        <span>体重</span>
      </Link>
    </footer>
  )
}

export default Footer
