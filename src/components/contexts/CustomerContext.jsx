import { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Load customers from localStorage
    const savedCustomers = localStorage.getItem('hotelCustomers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  useEffect(() => {
    // Save customers to localStorage whenever customers change
    localStorage.setItem('hotelCustomers', JSON.stringify(customers));
  }, [customers]);

  const addOrUpdateCustomer = (customerData, bookingAmount = 0) => {
    const existingCustomer = customers.find(c =>
      c.phone === customerData.customerPhone ||
      c.email === customerData.customerEmail
    );

    if (existingCustomer) {
      // Update existing customer
      const updatedCustomer = {
        ...existingCustomer,
        ...customerData,
        lastVisit: new Date().toISOString(),
        totalBookings: existingCustomer.totalBookings + 1,
        totalSpent: existingCustomer.totalSpent + bookingAmount,
        loyaltyPoints: existingCustomer.loyaltyPoints + Math.floor(bookingAmount / 100),
        updatedAt: new Date().toISOString()
      };

      setCustomers(prev =>
        prev.map(customer =>
          customer.id === existingCustomer.id
            ? updatedCustomer
            : customer
        )
      );

      return updatedCustomer;
    } else {
      // Create new customer
      const newCustomer = {
        id: Date.now(),
        name: customerData.customerName,
        email: customerData.customerEmail || '',
        phone: customerData.customerPhone,
        address: customerData.customerAddress || '',
        idProofType: customerData.idProofType,
        idProofNumber: customerData.idProofNumber,
        firstVisit: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        totalBookings: 1,
        totalSpent: bookingAmount,
        loyaltyPoints: Math.floor(bookingAmount / 100),
        loyaltyTier: 'Bronze',
        preferences: {
          roomType: customerData.roomType || '',
          specialRequests: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    }
  };

  const getCustomerByPhone = (phone) => {
    return customers.find(customer => customer.phone === phone);
  };

  const getCustomerByEmail = (email) => {
    return customers.find(customer => customer.email === email);
  };

  const updateCustomerLoyalty = (customerId) => {
    setCustomers(prev =>
      prev.map(customer => {
        if (customer.id === customerId) {
          const tier = calculateLoyaltyTier(customer.totalSpent, customer.totalBookings);
          return { ...customer, loyaltyTier: tier };
        }
        return customer;
      })
    );
  };

  const calculateLoyaltyTier = (totalSpent, totalBookings) => {
    if (totalSpent >= 50000 || totalBookings >= 20) return 'Platinum';
    if (totalSpent >= 25000 || totalBookings >= 10) return 'Gold';
    if (totalSpent >= 10000 || totalBookings >= 5) return 'Silver';
    return 'Bronze';
  };

  const getLoyaltyDiscount = (tier) => {
    const discounts = {
      Bronze: 0,
      Silver: 5,
      Gold: 10,
      Platinum: 15
    };
    return discounts[tier] || 0;
  };

  const getCustomerBookings = (customerId) => {
    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    return bookings.filter(booking => booking.customerId === customerId);
  };

  const searchCustomers = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      customer.email.toLowerCase().includes(term)
    );
  };

  const getTopCustomers = (limit = 10) => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  };

  const getCustomerStats = () => {
    const total = customers.length;
    const tierCounts = customers.reduce((acc, customer) => {
      acc[customer.loyaltyTier] = (acc[customer.loyaltyTier] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const averageSpent = total > 0 ? totalRevenue / total : 0;

    return {
      total,
      tierCounts,
      totalRevenue,
      averageSpent,
      totalLoyaltyPoints: customers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0)
    };
  };

  const addCustomerPreference = (customerId, preference) => {
    setCustomers(prev =>
      prev.map(customer => {
        if (customer.id === customerId) {
          return {
            ...customer,
            preferences: {
              ...customer.preferences,
              specialRequests: [...customer.preferences.specialRequests, preference]
            }
          };
        }
        return customer;
      })
    );
  };

  const value = {
    customers,
    addOrUpdateCustomer,
    getCustomerByPhone,
    getCustomerByEmail,
    updateCustomerLoyalty,
    calculateLoyaltyTier,
    getLoyaltyDiscount,
    getCustomerBookings,
    searchCustomers,
    getTopCustomers,
    getCustomerStats,
    addCustomerPreference
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};
