import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CATEGORIES } from '../data/mockData'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExplore, setMobileExplore] = useState(false)
  const { isLoggedIn, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setMobileExplore(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo" aria-label="K-TRIP home">
          K-TRIP
        </Link>

        <nav className="nav-desktop" aria-label="Main">
          <div className="nav-item nav-explore">
            <NavLink to="/explore" className="nav-link">
              Explore
            </NavLink>
            <div className="explore-dropdown">
              {CATEGORIES.map((c) => (
                <Link key={c} to={`/explore/${c.toLowerCase()}`} className="explore-dropdown-link">
                  {c}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/map" className="nav-link">
            Map
          </NavLink>
          <NavLink to="/community" className="nav-link">
            Community
          </NavLink>
        </nav>

        <div className="header-right">
          <button className="lang-btn" aria-label="Language">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
            </svg>
            <span>EN</span>
          </button>
          {isLoggedIn ? (
            <button className="login-link" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-link">
              Login
            </Link>
          )}
          <button
            className={`menu-btn ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${mobileOpen ? 'is-open' : ''}`}>
        <nav className="mobile-nav" aria-label="Mobile">
          <button
            className={`mobile-nav-link mobile-explore-toggle ${mobileExplore ? 'is-open' : ''}`}
            onClick={() => setMobileExplore(!mobileExplore)}
          >
            Explore
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div className={`mobile-explore-list ${mobileExplore ? 'is-open' : ''}`}>
            <div className="mobile-explore-inner">
              <Link to="/explore" className="mobile-explore-link">
                ALL EXPLORE
              </Link>
              {CATEGORIES.map((c) => (
                <Link key={c} to={`/explore/${c.toLowerCase()}`} className="mobile-explore-link">
                  {c}
                </Link>
              ))}
            </div>
          </div>
          <Link to="/map" className="mobile-nav-link">
            Map
          </Link>
          <Link to="/community" className="mobile-nav-link">
            Community
          </Link>
          {isLoggedIn ? (
            <button className="mobile-nav-link" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="mobile-nav-link">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
