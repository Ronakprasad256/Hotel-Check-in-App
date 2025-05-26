import React from 'react';

const BookingDetailsModal = ({ booking, onClose, isOpen }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          {/* Booking ID and Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">Booking #{booking.bookingId}</div>
            <div className="text-sm text-gray-500">Status: {booking.status === 'checked-in' ? 'Active' : 'Completed'}</div>
          </div>

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Name</div>
                <div className="text-base">{booking.customerName}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Phone</div>
                <div className="text-base">{booking.customerPhone}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Email</div>
                <div className="text-base">{booking.customerEmail || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Address</div>
                <div className="text-base">{booking.customerAddress || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Room Type</div>
                <div className="text-base">{getRoomTypeLabel(booking.roomType)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Room Number</div>
                <div className="text-base">{booking.roomNumber || 'Not assigned'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Rate per Night</div>
                <div className="text-base">₹{booking.roomRate}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Number of Guests</div>
                <div className="text-base">{booking.numberOfGuests}</div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Stay Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Check-in Date</div>
                <div className="text-base">{formatDate(booking.checkInDate)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Check-out Date</div>
                <div className="text-base">{formatDate(booking.checkOutDate)}</div>
              </div>
            </div>
          </div>

          {/* ID Proof */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">ID Proof Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">ID Type</div>
                <div className="text-base">{booking.idProofType}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">ID Number</div>
                <div className="text-base">{booking.idProofNumber}</div>
              </div>
            </div>
          </div>

          {/* Additional Guests */}
          {booking.guests && booking.guests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Guests</h3>
              <div className="space-y-2">
                {booking.guests.map((guest, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{guest.name}</div>
                      <div className="text-sm text-gray-500">Age: {guest.age}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 