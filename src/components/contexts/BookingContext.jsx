import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
const BookingContext = createContext();
import { HOTEL_ID, HOTEL_NAME, HOTEL_ADDRESS, HOTEL_PHONE, HOTEL_EMAIL, HOTEL_FAX } from '../../constents/constents';
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [nextBookingId, setNextBookingId] = useState(1);
  const { handleCheckIn, user, bookingsCheckIn, bookingsCheckOutData } = useAuth();
  // const { bookingsCheckIn, bookingsCheckOut } = useAuth();


  useEffect(() => {
    // Load bookings from localStorage
    const savedBookings = localStorage.getItem('hotelBookings');
    const savedNextId = localStorage.getItem('hotelNextBookingId');

    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
    if (savedNextId) {
      setNextBookingId(parseInt(savedNextId));
    }
  }, []);

  useEffect(() => {
    // Save bookings to localStorage whenever bookings change
    localStorage.setItem('hotelBookings', JSON.stringify(bookings));
    localStorage.setItem('hotelNextBookingId', nextBookingId.toString());
  }, [bookings, nextBookingId]);

  const addBooking = (bookingData) => {
    const now = new Date();
    const checkInDate = new Date(bookingData.checkInDate);

    // Determine booking status based on check-in date
    let status = 'confirmed'; // Default for advance bookings
    if (checkInDate.toDateString() === now.toDateString()) {
      status = 'checked-in'; // Same day booking
    } else if (checkInDate < now) {
      status = 'checked-in'; // Past date (shouldn't happen but handle gracefully)
    }
    function generateBookingId() {
      const timestamp = Date.now().toString().slice(-7); // last 7 digits of timestamp
      const random = Math.floor(100 + Math.random() * 900); // 3-digit random number
      return Number(timestamp + random); // 10-digit number
    }
    const newBooking = {
      id: nextBookingId,
      bookingId: generateBookingId(),
      ...bookingData,
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status,
      bookingType: checkInDate > now ? 'advance' : 'walk-in',
      paymentStatus: bookingData.paymentStatus || 'pending',
      hotelId: HOTEL_ID || '',
      hotelName: HOTEL_NAME || '',
      hotelAddress: HOTEL_ADDRESS || '',
      hotelPhone: HOTEL_PHONE || '',
      hotelEmail: HOTEL_EMAIL || '',
      hotelFax: HOTEL_FAX || '',
      uid: user?.uid,
    };

    handleCheckIn(newBooking);
    setBookings(prev => [...prev, newBooking]);
    setNextBookingId(prev => prev + 1);
    return newBooking;
  };

  const updateBooking = (bookingId, updates) => {
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, ...updates }
          : booking
      )
    );
  };

  const checkoutBooking = (bookingId, checkoutData) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const updatedBooking = {
        ...booking,
        ...checkoutData,
        status: 'checked-out',
        checkedOutAt: new Date().toISOString()
      };

      updateBooking(bookingId, updatedBooking);
      return updatedBooking;
    }
    return null;
  };

  const deleteBooking = (bookingId) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const getActiveBookings = () => {
    return bookings.filter(booking => booking.status === 'checked-in');
  };

  const getAllBookings = () => {
    return bookings;
  };

  const getConfirmedBookings = () => {
    return bookings.filter(booking => booking.status === 'confirmed');
  };

  const getTodaysArrivals = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking =>
      booking.status === 'confirmed' &&
      booking.checkInDate === today
    );
  };

  const getTodaysDepartures = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking =>
      booking.status === 'checked-in' &&
      booking.checkOutDate === today
    );
  };

  const getBookingsByDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!Array.isArray(bookingsCheckOutData)) return [];

    return bookingsCheckOutData.filter(booking => {
      if (!booking.bookingDate) return false;
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= start && bookingDate <= end;
    });
  };



  const getRevenueByDateRange = (startDate, endDate) => {
    const rangeBookings = getBookingsByDateRange(startDate, endDate);

    return rangeBookings.reduce((total, booking) => {
      const grandTotal = booking?.bill?.grandTotal ?? 0;
      return total + grandTotal;
    }, 0);
  };



  const checkInBooking = (bookingId) => {
    updateBooking(bookingId, {
      status: 'checked-in',
      actualCheckInTime: new Date().toISOString()
    });
  };

  const value = {
    bookings,
    addBooking,
    updateBooking,
    checkoutBooking,
    deleteBooking,
    getActiveBookings,
    getAllBookings,
    getConfirmedBookings,
    getTodaysArrivals,
    getTodaysDepartures,
    getBookingsByDateRange,
    getRevenueByDateRange,
    checkInBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
