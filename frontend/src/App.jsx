import React from 'react'

import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import UserPortal from './pages/UserPortal'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'

function App() {
    // Interceptor is now handled in services/api.js

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* User Portal Routes */}
            <Route path="/dashboard" element={<Layout><UserPortal section="dashboard" /></Layout>} />
            <Route path="/books" element={<Layout><UserPortal section="books" /></Layout>} />
            <Route path="/categories" element={<Layout><UserPortal section="categories" /></Layout>} />
            <Route path="/favorites" element={<Layout><UserPortal section="favorites" /></Layout>} />
            <Route path="/profile" element={<Layout><UserPortal section="profile" /></Layout>} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard section="overview" />} />
            <Route path="/admin/users" element={<AdminDashboard section="users" />} />
            <Route path="/admin/books" element={<AdminDashboard section="books" />} />
            <Route path="/admin/categories" element={<AdminDashboard section="categories" />} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default App
