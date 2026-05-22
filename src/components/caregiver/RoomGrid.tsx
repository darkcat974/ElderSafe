import React, { useState } from 'react'
import { AlertTriangle, Clock, User, BedDouble } from 'lucide-react'

interface Room {
  id: string
  number: string
  patientName: string
  status: 'normal' | 'warning' | 'alert'
  lastActivity: string
  needsAssistance: boolean
}

const RoomGrid: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      number: '101',
      patientName: 'Jean Dupont',
      status: 'normal',
      lastActivity: '2 min',
      needsAssistance: false
    },
    {
      id: '2',
      number: '102',
      patientName: 'Marie Martin',
      status: 'alert',
      lastActivity: '15 min',
      needsAssistance: true
    },
    {
      id: '3',
      number: '103',
      patientName: 'Robert Petit',
      status: 'warning',
      lastActivity: '8 min',
      needsAssistance: false
    },
    {
      id: '4',
      number: '104',
      patientName: 'Françoise Bernard',
      status: 'normal',
      lastActivity: '5 min',
      needsAssistance: false
    },
    {
      id: '5',
      number: '105',
      patientName: 'Jacques Moreau',
      status: 'normal',
      lastActivity: '3 min',
      needsAssistance: false
    },
    {
      id: '6',
      number: '106',
      patientName: 'Simone Dubois',
      status: 'alert',
      lastActivity: '20 min',
      needsAssistance: true
    },
    {
      id: '7',
      number: '107',
      patientName: 'Pierre Lambert',
      status: 'normal',
      lastActivity: '7 min',
      needsAssistance: false
    },
    {
      id: '8',
      number: '108',
      patientName: 'Jeanne Rousseau',
      status: 'warning',
      lastActivity: '12 min',
      needsAssistance: false
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 border-green-300'
      case 'warning':
        return 'bg-yellow-100 border-yellow-300'
      case 'alert':
        return 'bg-red-100 border-red-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const acknowledgeAlert = (id: string) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, status: 'normal', needsAssistance: false } : room
    ))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <div 
          key={room.id} 
          className={`border-2 rounded-lg p-4 ${getStatusColor(room.status)} transition-all duration-300 hover:shadow-md`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <BedDouble className="h-6 w-6 text-[#23a5e3] mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Chambre {room.number}</h3>
            </div>
            {room.status !== 'normal' && (
              <div className="flex items-center">
                {room.status === 'alert' ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center mb-3">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <p className="text-gray-800">{room.patientName}</p>
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Clock className="h-4 w-4 mr-1" />
            <span>Dernière activité: {room.lastActivity}</span>
          </div>

          {room.needsAssistance && (
            <div className="bg-red-200 text-red-800 p-2 rounded text-sm mb-3">
              Besoin d&apos;assistance immédiate
            </div>
          )}

          <div className="flex space-x-2">
            <button className="flex-1 bg-[#23a5e3] text-white py-1 px-2 rounded text-sm hover:bg-[#1e8fc4]">
              Détails
            </button>
            {(room.status === 'warning' || room.status === 'alert') && (
              <button 
                className="flex-1 bg-white text-gray-800 border border-gray-300 py-1 px-2 rounded text-sm hover:bg-gray-100"
                onClick={() => acknowledgeAlert(room.id)}
              >
                Acquiter
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default RoomGrid