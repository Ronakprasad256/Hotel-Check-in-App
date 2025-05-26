import { useRef } from 'react';
import { HOTEL_NAME, HOTEL_ADDRESS, HOTEL_PHONE, HOTEL_EMAIL, GST_NUMBER } from '../constents/constents';
const Invoice = ({ booking, onClose }) => {
  const printRef = useRef();
console.log(booking)
  const hotelName = HOTEL_NAME || '';
  const hotelAddress = HOTEL_ADDRESS || '';
  const hotelPhone = HOTEL_PHONE || '';
  const hotelEmail = HOTEL_EMAIL || '';
  const gstNumber = GST_NUMBER || '';

  const handlePrint = () => {
    const printContent = printRef.current;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React app
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString, onlyDate = false) => {
    const date = new Date(dateString);

    if (onlyDate) {
      // Return YYYY-MM-DD format
      return date.toISOString().split('T')[0];
    }

    // Return full formatted date and time in en-IN format
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  const getRoomTypeLabel = (roomType) => {
    const roomLabels = {
      'standard': 'Standard Room',
      'deluxe': 'Deluxe Room',
      'suite': 'Suite'
    };
    return roomLabels[roomType] || roomType;
  };

  const getIdProofLabel = (idType) => {
    const idLabels = {
      'aadhar': 'Aadhar Card',
      'pan': 'PAN Card',
      'driving': 'Driving License',
      'passport': 'Passport'
    };
    return idLabels[idType] || idType;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Action Buttons */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
          <h2 className="text-xl font-bold text-gray-900">GST Invoice</h2>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={printRef} className="p-8 bg-white">
          {/* Header */}
          <div className="border-b-2 border-gray-300 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{hotelName}</h1>
                <div className="mt-2 text-gray-600">
                  <p>{hotelAddress}</p>
                  <p>Phone: {hotelPhone}</p>
                  <p>Email: {hotelEmail}</p>
                  <p className="font-semibold">GST Number: {gstNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900">TAX INVOICE</h2>
                <div className="mt-2 text-gray-600">
                  <p><span className="font-semibold">Invoice No:</span> {booking?.invoiceNumber}</p>
                  <p><span className="font-semibold">Date:</span> {formatDate(booking?.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-semibold text-lg">{booking?.customerName}</p>
                {booking?.customerAddress && <p className="mt-1">{booking?.customerAddress}</p>}
                <p className="mt-1">Phone: {booking?.customerPhone}</p>
                {booking?.customerEmail && <p>Email: {booking?.customerEmail}</p>}
                <p className="mt-2">
                  <span className="font-semibold">ID Proof:</span> {getIdProofLabel(booking?.idProofType)} - {booking?.idProofNumber}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details:</h3>
              <div className="text-gray-700">
                <p><span className="font-semibold">Booking ID:</span> {booking?.bookingId}</p>
                <p><span className="font-semibold">Room Type:</span> {getRoomTypeLabel(booking?.roomType)}</p>
                {booking?.roomNumber && <p><span className="font-semibold">Room Number:</span> {booking?.roomNumber}</p>}
                <p><span className="font-semibold">Number of Guests:</span> {booking?.numberOfGuests}</p>
                <p><span className="font-semibold">Check-in Date:</span> {formatDate(booking?.checkInDate)}</p>
                <p><span className="font-semibold">Check-out Date:</span> {formatDate(booking?.actualCheckOutDate)}</p>
                <p><span className="font-semibold">Number of Nights:</span> {booking?.nights}</p>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          {booking?.guests && booking?.guests?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Guests:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking?.guests?.map((guest, index) => (
                    <div key={guest?.id || index} className="text-gray-700">
                      <p className="font-semibold">{guest?.name}</p>
                      <p className="text-sm">Age: {guest?.age}</p>
                      {guest?.idProofNumber && (
                        <p className="text-sm">{getIdProofLabel(guest?.idProofType)}: {guest?.idProofNumber}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bill Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Details:</h3>
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    {getRoomTypeLabel(booking?.roomType)} Accommodation
                    {booking?.roomNumber && ` (Room ${booking?.roomNumber})`}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{booking?.nights} night{booking?.nights > 1 ? 's' : ''}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{booking?.roomRate.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{booking?.bill?.roomCharges.toFixed(2)}</td>
                </tr>

                {booking?.bill?.additionalCharges > 0 && (
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Additional Charges
                      {booking?.additionalChargesDescription && ` (${booking?.additionalChargesDescription})`}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{booking?.bill?.additionalCharges.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">₹{booking?.bill?.additionalCharges.toFixed(2)}</td>
                  </tr>
                )}

                {booking?.bill?.discount > 0 && (
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Discount
                      {booking?.discountDescription && ` (${booking?.discountDescription})`}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">-₹{booking?.bill?.discount.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">-₹{booking?.bill?.discount.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation */}
          <div className="mb-8">
            <div className="flex justify-end">
              <div className="w-full max-w-md">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-right font-semibold">Subtotal:</td>
                      <td className="py-2 text-right">₹{booking?.bill?.totalBeforeTax.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-right">CGST (6%):</td>
                      <td className="py-2 text-right">₹{booking?.bill?.cgst.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-right">SGST (6%):</td>
                      <td className="py-2 text-right">₹{booking?.bill?.sgst.toFixed(2)}</td>
                    </tr>
                    <tr className="border-t-2 border-gray-300">
                      <td className="py-3 text-right text-xl font-bold">Grand Total:</td>
                      <td className="py-3 text-right text-xl font-bold">₹{booking?.bill?.grandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-8">
            <p className="text-gray-700">
              <span className="font-semibold">Amount in Words:</span> {numberToWords(booking?.bill?.grandTotal)} Rupees Only
            </p>
          </div>

          {/* Terms and Signature */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Terms and Conditions:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Payment is due at the time of check-out</li>
                <li>• All rates are inclusive of applicable taxes</li>
                <li>• Check-out time is 12:00 PM</li>
                <li>• Any damage to hotel property will be charged separately</li>
              </ul>
            </div>
            <div className="text-right">
              <div className="mt-16">
                <div className="border-t border-gray-400 inline-block w-48 pt-2">
                  <p className="text-sm text-gray-700">Authorized Signature</p>
                  <p className="text-sm font-semibold">{hotelName}</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
            <p>Thank you for staying with us! We look forward to serving you again.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert number to words (simplified version)
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

  if (num === 0) return 'Zero';

  let integerPart = Math.floor(num);
  let result = '';

  function convertHundreds(n) {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 10 && n < 20) {
      str += teens[n - 10] + ' ';
    } else {
      if (Math.floor(n / 10) > 0) {
        str += tens[Math.floor(n / 10)] + ' ';
      }
      if (n % 10 > 0) {
        str += ones[n % 10] + ' ';
      }
    }
    return str;
  }

  if (integerPart >= 10000000) {
    result += convertHundreds(Math.floor(integerPart / 10000000)) + 'Crore ';
    integerPart %= 10000000;
  }
  if (integerPart >= 100000) {
    result += convertHundreds(Math.floor(integerPart / 100000)) + 'Lakh ';
    integerPart %= 100000;
  }
  if (integerPart >= 1000) {
    result += convertHundreds(Math.floor(integerPart / 1000)) + 'Thousand ';
    integerPart %= 1000;
  }
  if (integerPart > 0) {
    result += convertHundreds(integerPart);
  }

  return result.trim();
}

export default Invoice;
