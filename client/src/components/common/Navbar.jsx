import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🍽 TableBook</Link>
      <div className="navbar-links">
        <Link to="/">Browse</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {isAdmin ? (
              <>
                <Link to="/admin">Add Restaurant</Link>
                <Link to="/admin/restaurants">Restaurant List</Link>
                <Link to="/admin/menu-items">Menu Items</Link>
                <Link to="/admin/reservations">Reservations</Link>
              </>
            ) : (
              <Link to="/dashboard/reservations">My Bookings</Link>
            )}
            <button onClick={handleSignOut} className="btn-ghost">Sign out</button>
          </>
        ) : (
          <Link to="/auth" className="btn-primary">Sign in</Link>
        )}
      </div>
    </nav>
  )
}
