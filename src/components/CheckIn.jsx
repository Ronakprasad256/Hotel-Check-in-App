import { useState, useEffect } from 'react';
import { useBooking } from './contexts/BookingContext';
import { useRoom } from './contexts/RoomContext';
import { useCustomer } from './contexts/CustomerContext';
import CheckInSuccessModal from './CheckInSuccessModal';

const CheckIn = () => {
  const { addBooking } = useBooking();
  const { getAvailableRooms } = useRoom();
  const { getCustomerByPhone, getLoyaltyDiscount, addOrUpdateCustomer } = useCustomer();

  const [formData, setFormData] = useState({
    // Primary guest details
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    idProofType: 'aadhar',
    idProofNumber: '',

    // Booking details
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    roomType: 'standard',
    roomNumber: '',
    numberOfGuests: 1,

    // Rate details
    roomRate: 2500,

    // Additional guests
    guests: []
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Check for existing customer when phone number changes
  useEffect(() => {
    if (formData.customerPhone.length >= 10) {
      const customer = getCustomerByPhone(formData.customerPhone);
      if (customer) {
        setExistingCustomer(customer);
        setLoyaltyDiscount(getLoyaltyDiscount(customer.loyaltyTier));
        // Auto-fill customer details
        setFormData(prev => ({
          ...prev,
          customerName: customer.name,
          customerEmail: customer.email,
          customerAddress: customer.address,
          idProofType: customer.idProofType,
          idProofNumber: customer.idProofNumber
        }));
      } else {
        setExistingCustomer(null);
        setLoyaltyDiscount(0);
      }
    }
  }, [formData.customerPhone, getCustomerByPhone, getLoyaltyDiscount]);

  // Update available rooms when dates or room type change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const available = getAvailableRooms(
        formData.checkInDate,
        formData.checkOutDate,
        formData.roomType
      );
      setAvailableRooms(available);

      // Clear room number if previously selected room is no longer available
      if (formData.roomNumber && !available.find(r => r.roomNumber === formData.roomNumber)) {
        setFormData(prev => ({ ...prev, roomNumber: '' }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomType, getAvailableRooms]);
  const [guestForm, setGuestForm] = useState({
    name: '',
    age: '',
    idProofType: 'aadhar',
    idProofNumber: ''
  });

  const roomTypes = [
    { value: 'standard', label: 'Standard Room', rate: 2500 },
    { value: 'deluxe', label: 'Deluxe Room', rate: 3500 },
    { value: 'suite', label: 'Suite', rate: 5000 }
  ];

  const idProofTypes = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'driving', label: 'Driving License' },
    { value: 'passport', label: 'Passport' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'roomType') {
      const selectedRoom = roomTypes.find(room => room.value === value);
      setFormData({
        ...formData,
        [name]: value,
        roomRate: selectedRoom.rate
      });
    } else if (name === 'numberOfGuests') {
      const guestCount = parseInt(value);
      setFormData({
        ...formData,
        [name]: guestCount,
        guests: formData.guests.slice(0, Math.max(0, guestCount - 1))
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleGuestChange = (e) => {
    setGuestForm({
      ...guestForm,
      [e.target.name]: e.target.value
    });
  };

  const addGuest = () => {
    if (guestForm.name && guestForm.age) {
      setFormData({
        ...formData,
        guests: [...formData.guests, { ...guestForm, id: Date.now() }]
      });
      setGuestForm({ name: '', age: '', idProofType: 'aadhar', idProofNumber: '' });
      setShowGuestForm(false);
    }
  };

  const removeGuest = (guestId) => {
    setFormData({
      ...formData,
      guests: formData.guests.filter(guest => guest.id !== guestId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.idProofNumber) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.numberOfGuests > 1 && formData.guests.length !== formData.numberOfGuests - 1) {
      alert(`Please add details for all ${formData.numberOfGuests - 1} additional guests`);
      return;
    }

    if (!formData.checkOutDate) {
      alert('Please select a check-out date');
      return;
    }

    // Calculate total amount for customer loyalty tracking
    const nights = Math.max(1, Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24)));
    const roomCharges = formData.roomRate * nights;
    const discountAmount = (roomCharges * loyaltyDiscount) / 100;
    const finalAmount = roomCharges - discountAmount;

    // Add or update customer in loyalty program
    const customer = addOrUpdateCustomer(formData, finalAmount);

    // Create booking with loyalty discount
    const bookingData = {
      ...formData,
      customerId: customer.id,
      loyaltyDiscount: loyaltyDiscount,
      loyaltyDiscountAmount: discountAmount,
      paymentStatus: 'pending'
    };

    const booking = addBooking(bookingData);

    // Set success data for modal
    setSuccessData({
      booking: {
        ...booking,
        roomType: formData.roomType,
        roomNumber: formData.roomNumber
      },
      customer: {
        name: customer.name,
        loyaltyTier: customer.loyaltyTier,
        totalBookings: customer.totalBookings,
        isExisting: !!existingCustomer,
        loyaltyDiscount: loyaltyDiscount,
        discountAmount: discountAmount
      }
    });
    setShowSuccessModal(true);

    // Reset form
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      idProofType: 'aadhar',
      idProofNumber: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '',
      roomType: 'standard',
      roomNumber: '',
      numberOfGuests: 1,
      roomRate: 2500,
      guests: []
    });
    setExistingCustomer(null);
    setLoyaltyDiscount(0);
    setAvailableRooms([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Customer Check-In</h2>
          <p className="text-gray-600">Register new customer and create booking</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
              {existingCustomer && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">Returning Customer</span>
                  </div>
                  <div className="mt-1 text-sm text-blue-700">
                    <p><strong>Loyalty Status:</strong> {existingCustomer.loyaltyTier} ({existingCustomer.loyaltyPoints} points)</p>
                    <p><strong>Total Bookings:</strong> {existingCustomer.totalBookings}</p>
                    {loyaltyDiscount > 0 && (
                      <p className="text-green-700 font-semibold">
                        🎉 {loyaltyDiscount}% loyalty discount applied!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Type *
              </label>
              <select
                name="idProofType"
                value={formData.idProofType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {idProofTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
 <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof Number *
              </label>
              <input
                type="text"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter ID proof number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full address"
              />
            </div>

           
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date
              </label>
              <input
                type="date"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type *
              </label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roomTypes.map(room => (
                  <option key={room.value} value={room.value}>
                    {room.label} - ₹{room.rate}/night
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number
              </label>
              {availableRooms.length > 0 ? (
                <select
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a room</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.roomNumber}>
                      Room {room.roomNumber} - Floor {room.floor} (Max: {room.maxOccupancy} guests)
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room number manually"
                  />
                  {formData.checkInDate && formData.checkOutDate && (
                    <p className="mt-1 text-sm text-orange-600">
                      ⚠️ No rooms available for selected dates and type. You may enter a room number manually.
                    </p>
                  )}
                </div>
              )}
              {availableRooms.length > 0 && (
                <p className="mt-1 text-sm text-green-600">
                  ✅ {availableRooms.length} room{availableRooms.length > 1 ? 's' : ''} available for your selected dates
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests *
              </label>
              <select
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Guests */}
          {formData.numberOfGuests > 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Additional Guests ({formData.guests.length}/{formData.numberOfGuests - 1})
                </h3>
                {formData.guests.length < formData.numberOfGuests - 1 && (
                  <button
                    type="button"
                    onClick={() => setShowGuestForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Guest
                  </button>
                )}
              </div>

              {/* Guest List */}
              {formData.guests.map((guest) => (
                <div key={guest.id} className="bg-gray-50 p-4 rounded-md mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{guest.name}</p>
                      <p className="text-sm text-gray-600">Age: {guest.age}</p>
                      <p className="text-sm text-gray-600">
                        {idProofTypes.find(type => type.value === guest.idProofType)?.label}: {guest.idProofNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGuest(guest.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Guest Form */}
              {showGuestForm && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guest Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={guestForm.name}
                        onChange={handleGuestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter guest name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={guestForm.age}
                        onChange={handleGuestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Proof Type
                      </label>
                      <select
                        name="idProofType"
                        value={guestForm.idProofType}
                        onChange={handleGuestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {idProofTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Proof Number
                      </label>
                      <input
                        type="text"
                        name="idProofNumber"
                        value={guestForm.idProofNumber}
                        onChange={handleGuestChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={addGuest}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGuestForm(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Complete Check-In
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <CheckInSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        booking={successData?.booking}
        customer={successData?.customer}
      />
    </div>
  );
};

export default CheckIn;
