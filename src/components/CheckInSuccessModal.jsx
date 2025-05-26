import React from 'react';

const CheckInSuccessModal = ({ isOpen, onClose, booking, customer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Check-In Successful!</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Booking Details */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              Booking ID: #{booking?.bookingId || booking?.id}
            </p>
          </div>

          {/* Customer Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            {customer.isExisting ? (
              <>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Welcome back, {customer.name}!
                </h3>
                <div className="space-y-2">
                  <p className="text-blue-800">
                    <span className="font-medium">Loyalty Status:</span> {customer.loyaltyTier}
                  </p>
                  <p className="text-blue-800">
                    <span className="font-medium">Total Bookings:</span> {customer.totalBookings}
                  </p>
                  {customer.loyaltyDiscount > 0 && (
                    <div className="bg-green-100 text-green-800 p-2 rounded mt-2">
                      <p className="font-medium">Loyalty Discount Applied!</p>
                      <p>{customer.loyaltyDiscount}% (₹{customer.discountAmount.toFixed(2)})</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Welcome to our hotel, {customer.name}!
                </h3>
                <p className="text-blue-800">
                  You've been enrolled in our loyalty program as a {customer.loyaltyTier} member.
                </p>
                <p className="text-blue-800 mt-2">
                  Start earning points with every stay!
                </p>
              </>
            )}
          </div>

          {/* Room Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Room Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Room Type</p>
                <p className="font-medium">{booking.roomType}</p>
              </div>
              {booking.roomNumber && (
                <div>
                  <p className="text-gray-600">Room Number</p>
                  <p className="font-medium">{booking.roomNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInSuccessModal; 