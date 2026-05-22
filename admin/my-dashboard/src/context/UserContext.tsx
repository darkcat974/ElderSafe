import React, { createContext, useContext } from 'react'

type UserRole = 'admin' | 'caregiver' | null

interface UserContextType {
  isAuthenticated: boolean
  userRole: UserRole
  login: (role: 'admin' | 'caregiver') => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode, value: UserContextType }> = ({ children, value }) => {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}