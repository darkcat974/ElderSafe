import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import CaregiverDashboard from './pages/CaregiverDashboard'
import Login from './pages/Login'
import { UserProvider } from './context/UserContext'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true'
  })
  const [userRole, setUserRole] = useState<'admin' | 'caregiver' | null>(() => {
    return localStorage.getItem('userRole') as 'admin' | 'caregiver' | null
  })

  const handleLogin = (role: 'admin' | 'caregiver') => {
    setIsAuthenticated(true)
    setUserRole(role)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userRole', role)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
  }

  return (
    <UserProvider value={{ isAuthenticated, userRole, login: handleLogin, logout: handleLogout }}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin/*" 
            element={
              isAuthenticated && userRole === 'admin' 
                ? <AdminDashboard /> 
                : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/caregiver/*" 
            element={
              isAuthenticated && userRole === 'caregiver' 
                ? <CaregiverDashboard /> 
                : <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </UserProvider>
  )
}

export default App