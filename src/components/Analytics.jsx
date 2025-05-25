import { useState, useMemo } from 'react';
import { useBooking } from './contexts/BookingContext';
import { useCustomer } from './contexts/CustomerContext';
import { useRoom } from './contexts/RoomContext';

const Analytics = () => {
  const { getAllBookings, getBookingsByDateRange, getRevenueByDateRange } = useBooking();
  const { getCustomerStats, getTopCustomers } = useCustomer();
  const { getRoomOccupancy } = useRoom();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const allBookings = getAllBookings();
  const roomOccupancy = getRoomOccupancy();
  const customerStats = getCustomerStats();
  const topCustomers = getTopCustomers(5);

  // Calculate analytics for the selected date range
  const analytics = useMemo(() => {
    const rangeBookings = getBookingsByDateRange(dateRange.startDate, dateRange.endDate);
    const totalRevenue = getRevenueByDateRange(dateRange.startDate, dateRange.endDate);

    const completedBookings = rangeBookings.filter(b => b.status === 'checked-out');
    const averageStay = completedBookings.length > 0
      ? completedBookings.reduce((sum, booking) => sum + (booking.nights || 1), 0) / completedBookings.length
      : 0;

    const roomTypeRevenue = rangeBookings.reduce((acc, booking) => {
      if (booking.bill && booking.bill.grandTotal) {
        acc[booking.roomType] = (acc[booking.roomType] || 0) + booking.bill.grandTotal;
      }
      return acc;
    }, {});

    const monthlyData = getMonthlyData(allBookings);
    const dailyOccupancy = getDailyOccupancy(rangeBookings);

    return {
      totalBookings: rangeBookings.length,
      completedBookings: completedBookings.length,
      totalRevenue,
      averageBookingValue: rangeBookings.length > 0 ? totalRevenue / rangeBookings.length : 0,
      averageStay: averageStay.toFixed(1),
      roomTypeRevenue,
      monthlyData,
      dailyOccupancy
    };
  }, [dateRange, allBookings, getBookingsByDateRange, getRevenueByDateRange]);

  const getMonthlyData = (bookings) => {
    const months = {};
    bookings.forEach(booking => {
      if (booking.bill && booking.bill.grandTotal) {
        const month = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short'
        });
        months[month] = (months[month] || 0) + booking.bill.grandTotal;
      }
    });
    return Object.entries(months).slice(-6); // Last 6 months
  };

  const getDailyOccupancy = (bookings) => {
    const daily = {};
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayBookings = bookings.filter(b =>
        b.checkInDate <= dateStr &&
        (b.checkOutDate >= dateStr || b.actualCheckOutDate >= dateStr)
      ).length;
      daily[dateStr] = dayBookings;
    }

    return Object.entries(daily).slice(-7); // Last 7 days
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getLoyaltyTierColor = (tier) => {
    const colors = {
      Bronze: 'text-amber-600 bg-amber-100',
      Silver: 'text-gray-600 bg-gray-100',
      Gold: 'text-yellow-600 bg-yellow-100',
      Platinum: 'text-purple-600 bg-purple-100'
    };
    return colors[tier] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Date Range Selector */}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
              <p className="text-sm text-gray-500">Selected period</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalBookings}</p>
              <p className="text-sm text-gray-500">{analytics.completedBookings} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Booking Value</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(analytics.averageBookingValue)}</p>
              <p className="text-sm text-gray-500">Per booking</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Stay Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.averageStay}</p>
              <p className="text-sm text-gray-500">Nights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
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
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
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

        {/* Daily Occupancy */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Occupancy (Last 7 Days)</h3>
          <div className="space-y-3">
            {analytics.dailyOccupancy.map(([date, occupancy]) => {
              const maxOccupancy = roomOccupancy.total;
              const percentage = maxOccupancy > 0 ? (occupancy / maxOccupancy) * 100 : 0;

              return (
                <div key={date} className="flex items-center space-x-3">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-medium text-gray-900 text-right">
                    {occupancy}/{maxOccupancy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Room Type */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Room Type</h3>
          <div className="space-y-4">
            {Object.entries(analytics.roomTypeRevenue).map(([type, revenue]) => {
              const totalRevenue = Object.values(analytics.roomTypeRevenue).reduce((sum, r) => sum + r, 0);
              const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
              const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{typeLabel}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        type === 'standard' ? 'bg-blue-500' :
                        type === 'deluxe' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total revenue</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.totalBookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyTierColor(customer.loyaltyTier)}`}>
                    {customer.loyaltyTier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{customerStats.total}</p>
            <p className="text-sm text-gray-500">Total Customers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{formatCurrency(customerStats.totalRevenue)}</p>
            <p className="text-sm text-gray-500">Total Customer Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(customerStats.averageSpent)}</p>
            <p className="text-sm text-gray-500">Average Spent per Customer</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{customerStats.totalLoyaltyPoints}</p>
            <p className="text-sm text-gray-500">Total Loyalty Points</p>
          </div>
        </div>

        {/* Loyalty Tier Distribution */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">Loyalty Tier Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(customerStats.tierCounts).map(([tier, count]) => (
              <div key={tier} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyTierColor(tier)}`}>
                  {tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
