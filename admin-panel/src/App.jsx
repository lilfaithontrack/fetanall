import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Subscriptions from './pages/Subscriptions'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Gallery from './pages/Gallery'
import ProtectedRoute from './components/ProtectedRoute'
import Posts from './pages/Posts'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="/posts" element={<Posts />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App