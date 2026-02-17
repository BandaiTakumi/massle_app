import './Layout.css'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
