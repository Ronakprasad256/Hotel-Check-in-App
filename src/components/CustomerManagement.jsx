import { useState, useEffect } from 'react';
import { useCustomer } from './contexts/CustomerContext';
import { useBooking } from './contexts/BookingContext';
import { useAuth } from './contexts/AuthContext';
const CustomerManagement = () => {
  const { customers, searchCustomers, getCustomerBookings, getLoyaltyDiscount } = useCustomer();
  const { getAllBookings } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterTier, setFilterTier] = useState('all');

  const { bookingsCheckInData, bookingsCheckOutData } = useAuth();
  const [mergedBookings, setMergedBookings] = useState([]);
  
  useEffect(() => {
    const mergedBookings = bookingsCheckInData.map((item, index) => ({
      ...item,
      ...bookingsCheckOutData[index]
    }));
    setMergedBookings(mergedBookings);
  }, [bookingsCheckInData, bookingsCheckOutData]);

  const allBookings = getAllBookings();
  const filteredCustomers = searchTerm
    ? searchCustomers(searchTerm)
    : customers;

  const displayCustomers = filterTier === 'all'
    ? filteredCustomers
    : filteredCustomers.filter(c => c.loyaltyTier === filterTier);

  const getLoyaltyTierColor = (tier) => {
    const colors = {
      Bronze: 'text-amber-600 bg-amber-100 border-amber-200',
      Silver: 'text-gray-600 bg-gray-100 border-gray-200',
      Gold: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      Platinum: 'text-purple-600 bg-purple-100 border-purple-200'
    };
    return colors[tier] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const CustomerDetailsModal = ({ customer, onClose }) => {
    const customerBookings = allBookings.filter(booking =>
      booking.customerPhone === customer.phone ||
      booking.customerEmail === customer.email
    );

    const completedBookings = customerBookings.filter(b => b.status === 'checked-out');
    const upcomingBookings = customerBookings.filter(b => b.status === 'confirmed');
    const activeBookings = customerBookings.filter(b => b.status === 'checked-in');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-blue-600">
                  {customer.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getLoyaltyTierColor(customer.loyaltyTier)}`}>
                  {customer.loyaltyTier} Member
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Phone:</span> {customer.phone}</p>
                  <p><span className="font-medium">Email:</span> {customer.email || 'Not provided'}</p>
                  <p><span className="font-medium">Address:</span> {customer.address || 'Not provided'}</p>
                  <p><span className="font-medium">ID Proof:</span> {customer.idProofType} - {customer.idProofNumber}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Loyalty Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{customer.totalBookings}</p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{customer.loyaltyPoints}</p>
                    <p className="text-sm text-gray-600">Loyalty Points</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{getLoyaltyDiscount(customer.loyaltyTier)}%</p>
                    <p className="text-sm text-gray-600">Discount Rate</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><span className="font-medium">First Visit:</span> {formatDate(customer.firstVisit)}</p>
                  <p><span className="font-medium">Last Visit:</span> {formatDate(customer.lastVisit)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking History</h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800">Active Bookings</h4>
                <p className="text-2xl font-bold text-red-600">{activeBookings.length}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800">Upcoming Bookings</h4>
                <p className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Completed Bookings</h4>
                <p className="text-2xl font-bold text-green-600">{completedBookings.length}</p>
              </div>
            </div>

            {/* Booking List */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No bookings found for this customer
                      </td>
                    </tr>
                  ) : (
                    customerBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.roomType} {booking.roomNumber && `(${booking.roomNumber})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.bill ? formatCurrency(booking.bill.grandTotal) : 'Pending'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'checked-in' ? 'bg-red-100 text-red-800' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {booking.status === 'checked-in' ? 'Active' :
                              booking.status === 'confirmed' ? 'Confirmed' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <p className="text-gray-600">Manage customer profiles and loyalty program</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-4">
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Loyalty Points</p>
              <p className="text-2xl font-semibold text-gray-900">
                {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Spend</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          {displayCustomers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyalty Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.loyaltyPoints} points</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                      <div className="text-sm text-gray-500">{customer.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getLoyaltyTierColor(customer.loyaltyTier)}`}>
                        {customer.loyaltyTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.lastVisit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
