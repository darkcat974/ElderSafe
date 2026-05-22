import React, { useState } from 'react'
import { CreditCard, Check, X } from 'lucide-react'

interface Subscription {
  id: string
  name: string
  type: 'Basic' | 'Standard' | 'Premium'
  status: 'Active' | 'Pending' | 'Expired'
  startDate: string
  endDate: string
  amount: number
  users: number
}

const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: '1',
      name: 'EHPAD Les Mimosas',
      type: 'Premium',
      status: 'Active',
      startDate: '2025-01-15',
      endDate: '2026-01-15',
      amount: 1200,
      users: 25
    },
    {
      id: '2',
      name: 'Centre médical Saint-Joseph',
      type: 'Standard',
      status: 'Active',
      startDate: '2024-11-10',
      endDate: '2025-11-10',
      amount: 750,
      users: 15
    },
    {
      id: '3',
      name: 'Résidence Les Chênes',
      type: 'Basic',
      status: 'Pending',
      startDate: '2025-03-01',
      endDate: '2026-03-01',
      amount: 400,
      users: 8
    },
    {
      id: '4',
      name: 'Clinique du Parc',
      type: 'Premium',
      status: 'Expired',
      startDate: '2024-01-20',
      endDate: '2025-01-20',
      amount: 1200,
      users: 30
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':  return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Expired': return 'bg-red-100 text-red-800'
      default:        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Basic':    return 'bg-blue-100 text-blue-800'
      case 'Standard': return 'bg-purple-100 text-purple-800'
      case 'Premium':  return 'bg-[#e1f3fb] text-[#23a5e3]'
      default:         return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Gestion des abonnements</h2>
        <button className="px-4 py-2 bg-[#23a5e3] text-white rounded-md hover:bg-[#1e8fc4] flex items-center">
          <CreditCard className="h-4 w-4 mr-2" />
          Nouvel abonnement
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Établissement</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateurs</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscription.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(subscription.type)}`}>
                      {subscription.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.amount} €/an</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.users}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-[#23a5e3] hover:text-[#1e8fc4]">Modifier</button>
                      <button className="text-red-600 hover:text-red-900">Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Forfaits disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Basic */}
          <div className="border rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900">Basic</h4>
            <p className="text-3xl font-bold mt-2">400 €<span className="text-sm font-normal text-gray-500">/an</span></p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Jusqu&apos;à 10 utilisateurs</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Alertes basiques</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Support par email</span></div>
              <div className="flex items-center"><X className="h-5 w-5 text-red-500 mr-2" /><span className="text-sm text-gray-400">Analyses avancées</span></div>
              <div className="flex items-center"><X className="h-5 w-5 text-red-500 mr-2" /><span className="text-sm text-gray-400">Support prioritaire</span></div>
            </div>
            <button className="mt-6 w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Sélectionner</button>
          </div>

          {/* Standard */}
          <div className="border rounded-lg p-6 border-[#23a5e3] shadow-md">
            <div className="bg-[#23a5e3] text-white text-xs font-bold uppercase py-1 px-2 rounded-full inline-block mb-2">Populaire</div>
            <h4 className="text-lg font-medium text-gray-900">Standard</h4>
            <p className="text-3xl font-bold mt-2">750 €<span className="text-sm font-normal text-gray-500">/an</span></p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Jusqu&apos;à 20 utilisateurs</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Alertes avancées</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Support par email et téléphone</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Analyses basiques</span></div>
              <div className="flex items-center"><X className="h-5 w-5 text-red-500 mr-2" /><span className="text-sm text-gray-400">Support prioritaire</span></div>
            </div>
            <button className="mt-6 w-full py-2 bg-[#23a5e3] text-white rounded-md hover:bg-[#1e8fc4]">Sélectionner</button>
          </div>

          {/* Premium */}
          <div className="border rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900">Premium</h4>
            <p className="text-3xl font-bold mt-2">1200 €<span className="text-sm font-normal text-gray-500">/an</span></p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Utilisateurs illimités</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Alertes personnalisées</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Support 24/7</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Analyses avancées</span></div>
              <div className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-sm text-gray-600">Support prioritaire</span></div>
            </div>
            <button className="mt-6 w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Sélectionner</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionManagement