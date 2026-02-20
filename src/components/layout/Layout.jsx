import './Layout.css'
import Footer from './Footer'
import RestTimer from '../common/RestTimer'
import { useLocation } from 'react-router-dom'

function Layout({ children }) {
  const location = useLocation()
  const showPopup = location.pathname !== '/training'
  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>
      <Footer />
      {showPopup && <RestTimer compact />}
    </div>
  )
}

export default Layout
