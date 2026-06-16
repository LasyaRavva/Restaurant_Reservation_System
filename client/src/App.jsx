import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/common/Navbar'

import Home from './pages/Home'
import RestaurantDetail from './pages/RestaurantDetail'
import MenuPage from './pages/MenuPage'
import BookingPage from './pages/BookingPage'
import ReservationConfirmation from './pages/ReservationConfirmation'
import Dashboard from './pages/Dashboard'
import MyReservations from './pages/MyReservations'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import AdminDashboard from './pages/AdminDashboard'
import AdminRestaurants from './pages/AdminRestaurants'
import AdminRestaurantEdit from './pages/AdminRestaurantEdit'
import AdminMenuItems from './pages/AdminMenuItems'
import AdminReservations from './pages/AdminReservations'
import AdminReservationAnalytics from './pages/AdminReservationAnalytics'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/restaurants/:id/menu" element={<MenuPage />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes */}
          <Route path="/restaurants/:id/book" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="/reservation-confirmation" element={
            <ProtectedRoute><ReservationConfirmation /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/reservations" element={
            <ProtectedRoute><MyReservations /></ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/restaurants" element={
            <ProtectedRoute requireAdmin><AdminRestaurants /></ProtectedRoute>
          } />
          <Route path="/admin/restaurants/:id" element={
            <ProtectedRoute requireAdmin><AdminRestaurantEdit /></ProtectedRoute>
          } />
          <Route path="/admin/menu-items" element={
            <ProtectedRoute requireAdmin><AdminMenuItems /></ProtectedRoute>
          } />
          <Route path="/admin/reservations" element={
            <ProtectedRoute requireAdmin><AdminReservations /></ProtectedRoute>
          } />
          <Route path="/admin/reservations/analytics" element={
            <ProtectedRoute requireAdmin><AdminReservationAnalytics /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
