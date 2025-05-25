import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useBooking } from './contexts/BookingContext';
import CheckIn from './CheckIn';
import BookingList from './BookingList';
import CheckOut from './CheckOut';
import RoomManagement from './RoomManagement';
import Analytics from './Analytics';
import CustomerManagement from './CustomerManagement';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const { logout } = useAuth();
  const { getActiveBookings, getAllBookings } = useBooking();

  const hotelName = import.meta.env.VITE_HOTEL_NAME || 'Hotel Management System';
  const activeBookings = getActiveBookings();
  const totalBookings = getAllBookings();

  const tabs = [
    { id: 'checkin', name: 'Check In', icon: '🏨' },
    { id: 'bookings', name: 'Bookings', icon: '📋' },
    { id: 'checkout', name: 'Check Out', icon: '🧾' },
    { id: 'rooms', name: 'Rooms', icon: '🚪' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'analytics', name: 'Analytics', icon: '📊' }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              {/* Stats */}
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

      {/* Navigation Tabs */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;