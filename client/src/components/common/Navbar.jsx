import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!menuOpen) return
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [menuOpen])

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  function linkClass(to, exact = false) {
    const active = exact
      ? location.pathname === to
      : to === '/'
        ? location.pathname === '/'
        : location.pathname === to || location.pathname.startsWith(`${to}/`)
    return active ? 'navbar-link active' : 'navbar-link'
  }

  const adminLinks = [
    { to: '/admin', label: 'Add Restaurant' },
    { to: '/admin/restaurants', label: 'Restaurant List' },
    { to: '/admin/menu-items', label: 'Menu Items' },
    { to: '/admin/reservations', label: 'Reservations' }
  ]

  const userLinks = [
    { to: '/dashboard/reservations', label: 'My Bookings' }
  ]

  const mobileLinks = [
    { to: '/', label: 'Browse' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }, ...(isAdmin ? adminLinks : userLinks)] : [])
  ]

  return (
    <nav className="navbar" ref={navRef}>
      <Link to="/" className="navbar-brand" onClick={closeMenu}>🍽 TableBook</Link>

      <button
        type="button"
        className="navbar-toggle"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        {menuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className="navbar-links navbar-desktop">
        <Link to="/" className={linkClass('/', true)}>Browse</Link>
        {user ? (
          <>
            <Link to="/dashboard" className={linkClass('/dashboard', true)}>Dashboard</Link>
            {isAdmin ? adminLinks.map(link => (
              <Link key={link.to} to={link.to} className={linkClass(link.to, true)}>{link.label}</Link>
            )) : userLinks.map(link => (
              <Link key={link.to} to={link.to} className={linkClass(link.to, true)}>{link.label}</Link>
            ))}
            <button onClick={handleSignOut} className="btn-ghost">Sign out</button>
          </>
        ) : (
          <Link to="/auth" className="btn-primary">Sign in</Link>
        )}
      </div>

      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        {mobileLinks.map(link => (
          <Link key={link.to} to={link.to} onClick={closeMenu} className={linkClass(link.to, true)}>
            {link.label}
          </Link>
        ))}
        {user ? (
          <button onClick={handleSignOut} className="btn-ghost navbar-mobile-signout">
            Sign out
          </button>
        ) : (
          <Link to="/auth" className="btn-primary" onClick={closeMenu}>
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}
