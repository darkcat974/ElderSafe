import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users } from 'lucide-react'
import { useUser } from '../context/UserContext'

const Login: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'caregiver'>('caregiver')
  const { login } = useUser()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real app, you would validate credentials here
    login(role)
    
    // Redirect based on role
    if (role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/caregiver')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#23a5e3]">ElderSafe</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Système de surveillance et d&apos;alerte pour personnes âgées
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Nom d&apos;utilisateur</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#23a5e3] focus:border-[#23a5e3] focus:z-10 sm:text-sm"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#23a5e3] focus:border-[#23a5e3] focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setRole('caregiver')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  role === 'caregiver' 
                    ? 'bg-[#23a5e3] text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                Aide-soignant
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  role === 'admin' 
                    ? 'bg-[#23a5e3] text-white' 
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Shield className="h-5 w-5 mr-2" />
                Administrateur
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#23a5e3] hover:bg-[#1e8fc4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#23a5e3]"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login