import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/mockData'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">K-TRIP</div>
          <p className="t-small t-muted">
            A personal Korea travel platform.
            <br />
            Discover Korea your way.
          </p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <div className="t-label t-faint">Explore</div>
            {CATEGORIES.map((c) => (
              <Link key={c} to={`/explore/${c.toLowerCase()}`} className="footer-link">
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <div className="t-label t-faint">Platform</div>
            <Link to="/" className="footer-link">
              Your Trip
            </Link>
            <Link to="/map" className="footer-link">
              Map
            </Link>
            <Link to="/community" className="footer-link">
              Community
            </Link>
            <Link to="/welcome" className="footer-link">
              Customize
            </Link>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span className="t-caption t-faint">© 2026 K-TRIP — Visual prototype. Mock data only.</span>
      </div>
    </footer>
  )
}
