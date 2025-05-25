import { useState, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useBooking } from './contexts/BookingContext';
import { useCustomer } from './contexts/CustomerContext';
import { useRoom } from './contexts/RoomContext';
import CheckIn from './CheckIn';
import BookingList from './BookingList';
import CheckOut from './CheckOut';
import RoomManagement from './RoomManagement';
import CustomerManagement from './CustomerManagement';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const { logout } = useAuth();
  const { getActiveBookings, getAllBookings, getBookingsByDateRange, getRevenueByDateRange } = useBooking();
  const { getCustomerStats, getTopCustomers } = useCustomer();
  const { getRoomOccupancy } = useRoom();

  const hotelName = import.meta.env.VITE_HOTEL_NAME || 'Hotel Management System';
  const activeBookings = getActiveBookings();
  const totalBookings = getAllBookings();

  const renderContent = () => {
    switch (activeTab) {
      case 'checkin':
        return <CheckIn />;
      case 'bookings':
        return <BookingList />;
      case 'checkout':
        return <CheckOut />;
      case 'rooms':
        return <RoomManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <CheckIn />;
    }
  };

  const tabs = [
    { id: 'checkin', name: 'Check In', icon: '🏨' },
    { id: 'bookings', name: 'Bookings', icon: '📋' },
    { id: 'checkout', name: 'Check Out', icon: '🧾' },
    { id: 'rooms', name: 'Rooms', icon: '🚪' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
  ];

  const Analytics = () => {
    const [dateRange, setDateRange] = useState({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    });

    const roomOccupancy = getRoomOccupancy();
    const customerStats = getCustomerStats();
    const topCustomers = getTopCustomers(5);

    const getMonthlyData = (bookings) => {
      const months = {};
      bookings.forEach((booking) => {
        if (booking.bill && booking.bill.grandTotal) {
          const month = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
          });
          months[month] = (months[month] || 0) + booking.bill.grandTotal;
        }
      });
      return Object.entries(months).slice(-6);
    };

    const getDailyOccupancy = (bookings) => {
      const daily = {};
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = bookings.filter(
          (b) => b.checkInDate <= dateStr && (b.checkOutDate >= dateStr || b.actualCheckOutDate >= dateStr)
        ).length;
        daily[dateStr] = dayBookings;
      }

      return Object.entries(daily).slice(-7);
    };

    const analytics = useMemo(() => {
      const rangeBookings = getBookingsByDateRange(dateRange.startDate, dateRange.endDate);
      const totalRevenue = getRevenueByDateRange(dateRange.startDate, dateRange.endDate);

      const completedBookings = rangeBookings.filter((b) => b.status === 'checked-out');
      const averageStay = completedBookings.length > 0
        ? completedBookings.reduce((sum, booking) => sum + (booking.nights || 1), 0) / completedBookings.length
        : 0;

      const roomTypeRevenue = rangeBookings.reduce((acc, booking) => {
        if (booking.bill && booking.bill.grandTotal) {
          acc[booking.roomType] = (acc[booking.roomType] || 0) + booking.bill.grandTotal;
        }
        return acc;
      }, {});

      return {
        totalBookings: rangeBookings.length,
        completedBookings: completedBookings.length,
        totalRevenue,
        averageBookingValue: rangeBookings.length > 0 ? totalRevenue / rangeBookings.length : 0,
        averageStay: averageStay.toFixed(1),
        roomTypeRevenue,
        monthlyData: getMonthlyData(totalBookings),
        dailyOccupancy: getDailyOccupancy(rangeBookings),
      };
    }, [dateRange, totalBookings, getBookingsByDateRange, getRevenueByDateRange]);

    const handleDateRangeChange = (field, value) => {
      setDateRange((prev) => ({ ...prev, [field]: value }));
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    };

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <div className="mt-4 sm:mt-0 flex space-x-4">
              <div>
                <label className="block text-sm text-gray-600">From</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">To</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
            <p className="text-sm text-gray-500">Selected period</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
            <p className="text-2xl font-semibold text-gray-900">{analytics.totalBookings}</p>
            <p className="text-sm text-gray-500">{analytics.completedBookings} completed</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Avg. Booking Value</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.averageBookingValue)}</p>
            <p className="text-sm text-gray-500">Per booking</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Avg. Stay Duration</p>
            <p className="text-2xl font-semibold text-gray-900">{analytics.averageStay}</p>
            <p className="text-sm text-gray-500">Nights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <div className="space-y-3">
              {analytics.monthlyData.map(([month, revenue]) => {
                const maxRevenue = Math.max(...analytics.monthlyData.map(([, r]) => r));
                const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={month} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-600">{month}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-24 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Occupancy (Last 7 Days)</h3>
            <div className="space-y-3">
              {analytics.dailyOccupancy.map(([date, occupancy]) => {
                const max = Math.max(...analytics.dailyOccupancy.map(([, o]) => o));
                const percent = max > 0 ? (occupancy / max) * 100 : 0;
                return (
                  <div key={date} className="flex items-center space-x-3">
                    <div className="w-24 text-sm text-gray-600">{date}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="w-10 text-sm font-medium text-gray-900 text-right">
                      {occupancy}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">{hotelName}</h1>
                <p className="text-sm text-gray-500">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeBookings.length}</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalBookings.length}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{renderContent()}</main>
    </div>
  );
};

export default Dashboard;
