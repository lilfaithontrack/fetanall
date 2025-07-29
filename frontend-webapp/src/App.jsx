
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import Gallery from './pages/Gallery'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={
              <AuthGuard>
                <Products />
              </AuthGuard>
            } />
            <Route path="gallery" element={
              <AuthGuard>
                <Gallery />
              </AuthGuard>
            } />
            <Route path="cart" element={
              <AuthGuard>
                <Cart />
              </AuthGuard>
            } />
            <Route path="profile" element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
