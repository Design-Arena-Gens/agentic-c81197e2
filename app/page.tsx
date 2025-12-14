'use client'

import { useState, useEffect } from 'react'

type RoomStatus = 'occ' | 'VC' | 'DND' | 'S/O' | 'VD' | ''
type ExtraItem = 'Babycot' | 'Extra Bed' | ''

interface RoomData {
  room: string
  status: RoomStatus
  guests: string
  extras: ExtraItem[]
}

export default function Home() {
  const [date, setDate] = useState('')
  const [attendant, setAttendant] = useState('')
  const [rooms, setRooms] = useState<RoomData[]>([])

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setDate(today)

    const roomNumbers = [
      '101', '102', '103', '104', '105', '106', '107', '108', '109',
      '201', '202', '203', '204', '205', '206', '207', '208', '209',
      '301', '302', '303', '304', '305', '306', '307', '308', '309'
    ]

    setRooms(roomNumbers.map(room => ({
      room,
      status: '',
      guests: '',
      extras: []
    })))
  }, [])

  const updateRoom = (index: number, field: keyof RoomData, value: any) => {
    const newRooms = [...rooms]
    newRooms[index] = { ...newRooms[index], [field]: value }
    setRooms(newRooms)
  }

  const toggleExtra = (index: number, extra: ExtraItem) => {
    const newRooms = [...rooms]
    const currentExtras = newRooms[index].extras
    if (currentExtras.includes(extra)) {
      newRooms[index].extras = currentExtras.filter(e => e !== extra)
    } else {
      newRooms[index].extras = [...currentExtras, extra]
    }
    setRooms(newRooms)
  }

  const generateWhatsAppMessage = () => {
    const dateObj = new Date(date)
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    let message = `Occupancy - Morning\nDate: ${formattedDate}\nAttendant: ${attendant}\n\n`

    rooms.forEach(room => {
      if (room.status) {
        message += `${room.room}- `
        if (room.status === 'occ' && room.guests) {
          message += `occ ${room.guests}`
        } else {
          message += room.status
        }
        message += '\n'
      }
    })

    const babycots = rooms.filter(r => r.extras.includes('Babycot')).map(r => r.room)
    const extraBeds = rooms.filter(r => r.extras.includes('Extra Bed')).map(r => r.room)

    if (babycots.length > 0) {
      message += `\nBabycot: ${babycots.join(', ')}`
    }
    if (extraBeds.length > 0) {
      message += `\nExtra Bed: ${extraBeds.join(', ')}`
    }

    return message
  }

  const sendToWhatsApp = () => {
    const message = generateWhatsAppMessage()
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
  }

  const copyToClipboard = () => {
    const message = generateWhatsAppMessage()
    navigator.clipboard.writeText(message)
    alert('Copied to clipboard!')
  }

  const statusOptions: RoomStatus[] = ['occ', 'VC', 'DND', 'S/O', 'VD']

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Hotel Occupancy Tracker</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attendant Name</label>
              <input
                type="text"
                value={attendant}
                onChange={(e) => setAttendant(e.target.value)}
                placeholder="Enter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {rooms.map((room, index) => (
            <div key={room.room} className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center gap-3">
                <div className="font-bold text-gray-700 w-12">{room.room}</div>

                <select
                  value={room.status}
                  onChange={(e) => updateRoom(index, 'status', e.target.value as RoomStatus)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                {room.status === 'occ' && (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={room.guests}
                    onChange={(e) => updateRoom(index, 'guests', e.target.value)}
                    placeholder="# guests"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => toggleExtra(index, 'Babycot')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      room.extras.includes('Babycot')
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Babycot
                  </button>
                  <button
                    onClick={() => toggleExtra(index, 'Extra Bed')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      room.extras.includes('Extra Bed')
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Extra Bed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={sendToWhatsApp}
            disabled={!attendant}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send to WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
