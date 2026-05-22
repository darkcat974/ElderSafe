import React from 'react'
import { Users, Bell, CreditCard, Activity } from 'lucide-react'

const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-[#23a5e3]">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Utilisateurs actifs</p>
              <p className="text-2xl font-semibold text-gray-900">42</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium">+12%</span>
              <span className="text-gray-500 ml-2">depuis le mois dernier</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenus mensuels</p>
              <p className="text-2xl font-semibold text-gray-900">8,650 €</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium">+8%</span>
              <span className="text-gray-500 ml-2">depuis le mois dernier</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Bell className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Alertes aujourd&apos;hui</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-red-500 font-medium">+15%</span>
              <span className="text-gray-500 ml-2">depuis hier</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Temps de réponse moyen</p>
              <p className="text-2xl font-semibold text-gray-900">2.4 min</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium">-18%</span>
              <span className="text-gray-500 ml-2">depuis la semaine dernière</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-[#23a5e3] flex items-center justify-center text-white">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Nouvel utilisateur inscrit</p>
                  <p className="text-sm text-gray-500">Centre médical Saint-Joseph</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Il y a 2 heures</p>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Nouvel abonnement Premium</p>
                  <p className="text-sm text-gray-500">EHPAD Les Mimosas</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Il y a 5 heures</p>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <Bell className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Alerte système critique</p>
                  <p className="text-sm text-gray-500">Serveur de données principal</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Il y a 12 heures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview