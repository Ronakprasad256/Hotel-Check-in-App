import { useState } from 'react';
import { useRoom } from './contexts/RoomContext';
import { useBooking } from './contexts/BookingContext';

const RoomManagement = () => {
  const { rooms, getRoomOccupancy, updateRoomStatus, getRoomsByType } = useRoom();
  const { getActiveBookings } = useBooking();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const occupancy = getRoomOccupancy();
  const roomsByType = getRoomsByType();
  const activeBookings = getActiveBookings();

  // Create a map of room assignments
  const roomAssignments = activeBookings.reduce((acc, booking) => {
    if (booking.roomNumber) {
      acc[booking.roomNumber] = booking;
    }
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      reserved: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoomTypeLabel = (type) => {
    const labels = {
      standard: 'Standard',
      deluxe: 'Deluxe',
      suite: 'Suite'
    };
    return labels[type] || type;
  };

  const handleStatusChange = (roomNumber, newStatus) => {
    updateRoomStatus(roomNumber, newStatus);
  };

  const filteredRooms = rooms.filter(room => {
    const typeMatch = filterType === 'all' || room.type === filterType;
    const statusMatch = filterStatus === 'all' || room.status === filterStatus;
    return typeMatch && statusMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Occupancy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Rooms</p>
              <p className="text-2xl font-semibold text-gray-900">{occupancy.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Occupied</p>
              <p className="text-2xl font-semibold text-gray-900">{occupancy.occupied}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available</p>
              <p className="text-2xl font-semibold text-gray-900">{occupancy.available}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="text-2xl font-semibold text-gray-900">{occupancy.maintenance}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{occupancy.occupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Room Management</h2>
          <div className="flex space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredRooms.map((room) => {
          const assignment = roomAssignments[room.roomNumber];
          const actualStatus = assignment ? 'occupied' : room.status;

          return (
            <div
              key={room.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                actualStatus === 'occupied' ? 'border-red-200 bg-red-50' :
                actualStatus === 'available' ? 'border-green-200 bg-green-50' :
                actualStatus === 'maintenance' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(actualStatus)}`}>
                  {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>Type: {getRoomTypeLabel(room.type)}</p>
                <p>Floor: {room.floor}</p>
                <p>Rate: ₹{room.rate}/night</p>
                <p>Max Guests: {room.maxOccupancy}</p>
              </div>

              {assignment && (
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-xs font-semibold text-gray-900">{assignment.customerName}</p>
                  <p className="text-xs text-gray-600">Check-out: {new Date(assignment.checkOutDate).toLocaleDateString()}</p>
                </div>
              )}

              {!assignment && room.status !== 'maintenance' && (
                <div className="mt-3">
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room.roomNumber, e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              )}

              {room.status === 'maintenance' && !assignment && (
                <div className="mt-3">
                  <button
                    onClick={() => handleStatusChange(room.roomNumber, 'available')}
                    className="w-full px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Mark Available
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Room Type Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Type Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(roomsByType).map(([type, typeRooms]) => {
            const available = typeRooms.filter(r => r.status === 'available' && !roomAssignments[r.roomNumber]).length;
            const occupied = typeRooms.filter(r => roomAssignments[r.roomNumber]).length;
            const maintenance = typeRooms.filter(r => r.status === 'maintenance').length;

            return (
              <div key={type} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{getRoomTypeLabel(type)}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{typeRooms.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className="font-medium text-green-600">{available}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occupied:</span>
                    <span className="font-medium text-red-600">{occupied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <span className="font-medium text-yellow-600">{maintenance}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span>Rate:</span>
                    <span className="font-medium">₹{typeRooms[0]?.rate}/night</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;