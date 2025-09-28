import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import logo from '/src/assets/logo.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  
  const getLinkClass = (isActive) => 
    isActive ? 'navbar-link active' : 'navbar-link'
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Lifebox NextGen logo" />
          <span>Lifebox NextGen</span>
        </Link>
        
        <button
          className="navbar-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        
        <div className="navbar-menu">
          <NavLink to="/" className={({isActive}) => getLinkClass(isActive)}>
            Home
          </NavLink>
          <NavLink to="/about" className={({isActive}) => getLinkClass(isActive)}>
            About Us
          </NavLink>
          <NavLink to="/services" className={({isActive}) => getLinkClass(isActive)}>
            Services
          </NavLink>
          <a href="/nextgen" target="_blank" rel="noreferrer" className="navbar-link">
            NextGenFreeEdu
          </a>
          <NavLink to="/careers" className={({isActive}) => getLinkClass(isActive)}>
            Careers
          </NavLink>
          <NavLink to="/contact" className={({isActive}) => getLinkClass(isActive)}>
            Contact Us
          </NavLink>
          <div className="navbar-dropdown">
            <button className="navbar-link dropdown-toggle">
              Employee Login ▼
            </button>
            <div className="dropdown-menu">
              <Link to="/portal/admin" className="dropdown-item">Admin Portal</Link>
              <Link to="/portal/hr" className="dropdown-item">HR Portal</Link>
              <Link to="/portal/team-lead" className="dropdown-item">Team Lead Portal</Link>
              <Link to="/portal/manager" className="dropdown-item">Manager Portal</Link>
              <Link to="/portal/employee" className="dropdown-item">Employee Portal</Link>
            </div>
          </div>
        </div>
      </div>
      
      {open && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            <NavLink to="/" onClick={() => setOpen(false)} className={({isActive}) => getLinkClass(isActive)}>
              Home
            </NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)} className={({isActive}) => getLinkClass(isActive)}>
              About Us
            </NavLink>
            <NavLink to="/services" onClick={() => setOpen(false)} className={({isActive}) => getLinkClass(isActive)}>
              Services
            </NavLink>
            <a href="/nextgen" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="navbar-link">
              NextGenFreeEdu
            </a>
            <NavLink to="/careers" onClick={() => setOpen(false)} className={({isActive}) => getLinkClass(isActive)}>
              Careers
            </NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)} className={({isActive}) => getLinkClass(isActive)}>
              Contact Us
            </NavLink>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Employee Portals
              </div>
              <Link to="/portal/admin" onClick={() => setOpen(false)} className="navbar-link">Admin Portal</Link>
              <Link to="/portal/hr" onClick={() => setOpen(false)} className="navbar-link">HR Portal</Link>
              <Link to="/portal/team-lead" onClick={() => setOpen(false)} className="navbar-link">Team Lead Portal</Link>
              <Link to="/portal/manager" onClick={() => setOpen(false)} className="navbar-link">Manager Portal</Link>
              <Link to="/portal/employee" onClick={() => setOpen(false)} className="navbar-link">Employee Portal</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

