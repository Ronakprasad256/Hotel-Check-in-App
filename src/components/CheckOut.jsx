import { useState } from 'react';
import { useBooking } from './contexts/BookingContext';
import Invoice from './Invoice';

const CheckOut = () => {
  const { getActiveBookings, checkoutBooking } = useBooking();
  const [selectedBooking, setSelectedBooking] = useState('');
  const [checkoutData, setCheckoutData] = useState({
    actualCheckOutDate: new Date().toISOString().split('T')[0],
    nights: 1,
    additionalCharges: 0,
    additionalChargesDescription: '',
    discount: 0,
    discountDescription: ''
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  const activeBookings = getActiveBookings();
  const selectedBookingData = activeBookings.find(b => b.id === parseInt(selectedBooking));

  const handleBookingChange = (e) => {
    const bookingId = e.target.value;
    setSelectedBooking(bookingId);

    if (bookingId) {
      const booking = activeBookings.find(b => b.id === parseInt(bookingId));
      if (booking && booking.checkInDate && booking.checkOutDate) {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

        setCheckoutData(prev => ({
          ...prev,
          nights: nights,
          actualCheckOutDate: booking.checkOutDate || new Date().toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: name.includes('nights') || name.includes('Charges') || name.includes('discount')
        ? parseFloat(value) || 0
        : value
    }));
  };

  const calculateBill = () => {
    if (!selectedBookingData) return null;

    const roomCharges = selectedBookingData.roomRate * checkoutData.nights;
    const totalBeforeTax = roomCharges + checkoutData.additionalCharges - checkoutData.discount;

    // GST calculation (12% for hotel accommodation)
    const cgst = totalBeforeTax * 0.06; // 6% CGST
    const sgst = totalBeforeTax * 0.06; // 6% SGST
    const totalTax = cgst + sgst;
    const grandTotal = totalBeforeTax + totalTax;

    return {
      roomCharges,
      additionalCharges: checkoutData.additionalCharges,
      discount: checkoutData.discount,
      totalBeforeTax,
      cgst,
      sgst,
      totalTax,
      grandTotal
    };
  };

  const handleCheckOut = () => {
    if (!selectedBookingData) {
      alert('Please select a booking to checkout');
      return;
    }

    const bill = calculateBill();
    const invoiceData = {
      ...checkoutData,
      bill,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString()
    };

    const updatedBooking = checkoutBooking(selectedBookingData.id, invoiceData);

    if (updatedBooking) {
      setGeneratedInvoice(updatedBooking);
      setShowInvoice(true);

      // Reset form
      setSelectedBooking('');
      setCheckoutData({
        actualCheckOutDate: new Date().toISOString().split('T')[0],
        nights: 1,
        additionalCharges: 0,
        additionalChargesDescription: '',
        discount: 0,
        discountDescription: ''
      });
    }
  };

  const bill = calculateBill();

  if (showInvoice && generatedInvoice) {
    return (
      <Invoice
        booking={generatedInvoice}
        onClose={() => setShowInvoice(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Customer Check-Out</h2>
          <p className="text-gray-600">Generate GST invoice and complete checkout</p>
        </div>

        <div className="p-6">
          {activeBookings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Bookings</h3>
              <p className="mt-1 text-gray-500">There are no customers currently checked in.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Booking Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Booking to Check Out *
                </label>
                <select
                  value={selectedBooking}
                  onChange={handleBookingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a booking...</option>
                  {activeBookings.map(booking => (
                    <option key={booking.id} value={booking.id}>
                      #{booking.id} - {booking.customerName} - Room {booking.roomNumber || booking.roomType}
                      (Check-in: {new Date(booking.checkInDate).toLocaleDateString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBookingData && (
                <>
                  {/* Customer Details Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Name:</span> {selectedBookingData.customerName}</p>
                        <p><span className="font-medium">Phone:</span> {selectedBookingData.customerPhone}</p>
                        <p><span className="font-medium">Email:</span> {selectedBookingData.customerEmail || 'Not provided'}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">ID Proof:</span> {selectedBookingData.idProofType} - {selectedBookingData.idProofNumber}</p>
                        <p><span className="font-medium">Room:</span> {selectedBookingData.roomType} {selectedBookingData.roomNumber && `(${selectedBookingData.roomNumber})`}</p>
                        <p><span className="font-medium">Guests:</span> {selectedBookingData.numberOfGuests}</p>
                      </div>
                    </div>
                    {selectedBookingData.customerAddress && (
                      <div className="mt-2">
                        <p><span className="font-medium">Address:</span> {selectedBookingData.customerAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Checkout Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Check-out Date *
                      </label>
                      <input
                        type="date"
                        name="actualCheckOutDate"
                        value={checkoutData.actualCheckOutDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Nights *
                      </label>
                      <input
                        type="number"
                        name="nights"
                        value={checkoutData.nights}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Charges (₹)
                      </label>
                      <input
                        type="number"
                        name="additionalCharges"
                        value={checkoutData.additionalCharges}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., room service, minibar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Charges Description
                      </label>
                      <input
                        type="text"
                        name="additionalChargesDescription"
                        value={checkoutData.additionalChargesDescription}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Room service, Laundry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={checkoutData.discount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Description
                      </label>
                      <input
                        type="text"
                        name="discountDescription"
                        value={checkoutData.discountDescription}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Senior citizen, Corporate"
                      />
                    </div>
                  </div>

                  {/* Bill Preview */}
                  {bill && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Preview</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Room Charges ({checkoutData.nights} nights × ₹{selectedBookingData.roomRate}):</span>
                          <span>₹{bill.roomCharges.toFixed(2)}</span>
                        </div>

                        {bill.additionalCharges > 0 && (
                          <div className="flex justify-between">
                            <span>Additional Charges{checkoutData.additionalChargesDescription && ` (${checkoutData.additionalChargesDescription})`}:</span>
                            <span>₹{bill.additionalCharges.toFixed(2)}</span>
                          </div>
                        )}

                        {bill.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount{checkoutData.discountDescription && ` (${checkoutData.discountDescription})`}:</span>
                            <span>-₹{bill.discount.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>₹{bill.totalBeforeTax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>CGST (6%):</span>
                            <span>₹{bill.cgst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>SGST (6%):</span>
                            <span>₹{bill.sgst.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Grand Total:</span>
                            <span>₹{bill.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleCheckOut}
                      className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Complete Check-Out & Generate Invoice
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
