import { useState } from 'react';
import { useBooking } from './contexts/BookingContext';
import PaymentModal from './PaymentModal';
import { useAuth } from './contexts/AuthContext';
import BookingDetailsModal from './BookingDetailsModal';

const BookingList = () => {
  const { deleteBooking } = useBooking();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { bookingsCheckInData } = useAuth();

  const filteredBookings = bookingsCheckInData?.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.id.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(bookingId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'checked-in': 'bg-green-100 text-green-800',
      'checked-out': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-blue-100 text-blue-800'}`}>
        {status === 'checked-in' ? 'Active' : 'Completed'}
      </span>
    );
  };

  const getRoomTypeLabel = (roomType) => {
    const roomLabels = {
      'standard': 'Standard Room',
      'deluxe': 'Deluxe Room',
      'suite': 'Suite'
    };
    return roomLabels[roomType] || roomType;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
              <p className="text-gray-600">Manage all customer bookings</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Bookings</option>
                <option value="checked-in">Active</option>
                <option value="checked-out">Completed</option>
              </select>
              <input
                type="text"
                placeholder="Search by name, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Booking #{booking.bookingId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.numberOfGuests} Guest{booking.numberOfGuests > 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerPhone}
                        </div>
                        {booking.customerEmail && (
                          <div className="text-sm text-gray-500">
                            {booking.customerEmail}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getRoomTypeLabel(booking.roomType)}
                        </div>
                        {booking.roomNumber && (
                          <div className="text-sm text-gray-500">
                            Room {booking.roomNumber}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          ₹{booking.roomRate}/night
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          Check-in: {formatDate(booking.checkInDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Check-out: {formatDate(booking.checkOutDate)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsDetailsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredBookings.filter(b => b.status === 'checked-in').length}
              </div>
              <div className="text-sm text-gray-500">Active Bookings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredBookings.filter(b => b.status === 'checked-out').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">
                {filteredBookings.length}
              </div>
              <div className="text-sm text-gray-500">Total Shown</div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
};

export default BookingList;
