import { createContext, useContext, useState, useEffect } from 'react';

const RoomContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Initialize default rooms if none exist
    const savedRooms = localStorage.getItem('hotelRooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    } else {
      // Create default room inventory
      const defaultRooms = generateDefaultRooms();
      setRooms(defaultRooms);
      localStorage.setItem('hotelRooms', JSON.stringify(defaultRooms));
    }
  }, []);

  useEffect(() => {
    // Save rooms to localStorage whenever rooms change
    if (rooms.length > 0) {
      localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    }
  }, [rooms]);

  const generateDefaultRooms = () => {
    const roomTypes = [
      { type: 'standard', rate: 2500, floors: [1, 2], roomsPerFloor: 10 },
      { type: 'deluxe', rate: 3500, floors: [3, 4], roomsPerFloor: 8 },
      { type: 'suite', rate: 5000, floors: [5], roomsPerFloor: 6 }
    ];

    const allRooms = [];
    let roomId = 1;

    roomTypes.forEach(({ type, rate, floors, roomsPerFloor }) => {
      floors.forEach(floor => {
        for (let i = 1; i <= roomsPerFloor; i++) {
          const roomNumber = `${floor}${i.toString().padStart(2, '0')}`;
          allRooms.push({
            id: roomId++,
            roomNumber,
            type,
            rate,
            floor,
            status: 'available', // available, occupied, maintenance, reserved
            amenities: getAmenitiesForType(type),
            maxOccupancy: getMaxOccupancyForType(type)
          });
        }
      });
    });

    return allRooms;
  };

  const getAmenitiesForType = (type) => {
    const amenities = {
      standard: ['AC', 'TV', 'WiFi', 'Bathroom'],
      deluxe: ['AC', 'TV', 'WiFi', 'Bathroom', 'Minibar', 'Balcony'],
      suite: ['AC', 'TV', 'WiFi', 'Bathroom', 'Minibar', 'Balcony', 'Living Room', 'Room Service']
    };
    return amenities[type] || [];
  };

  const getMaxOccupancyForType = (type) => {
    const occupancy = {
      standard: 2,
      deluxe: 3,
      suite: 4
    };
    return occupancy[type] || 2;
  };

  const getAvailableRooms = (checkIn, checkOut, roomType = null) => {
    // Get bookings that overlap with the requested dates
    const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');

    const overlappingBookings = bookings.filter(booking => {
      if (booking.status === 'checked-out') return false;

      const bookingCheckIn = new Date(booking.checkInDate);
      const bookingCheckOut = new Date(booking.actualCheckOutDate || booking.checkOutDate);
      const requestedCheckIn = new Date(checkIn);
      const requestedCheckOut = new Date(checkOut);

      // Check if dates overlap
      return (requestedCheckIn < bookingCheckOut && requestedCheckOut > bookingCheckIn);
    });

    const occupiedRoomNumbers = overlappingBookings
      .filter(booking => booking.roomNumber)
      .map(booking => booking.roomNumber);

    return rooms.filter(room => {
      const typeMatch = !roomType || room.type === roomType;
      const notOccupied = !occupiedRoomNumbers.includes(room.roomNumber);
      const notInMaintenance = room.status !== 'maintenance';

      return typeMatch && notOccupied && notInMaintenance;
    });
  };

  const getRoomByNumber = (roomNumber) => {
    return rooms.find(room => room.roomNumber === roomNumber);
  };

  const updateRoomStatus = (roomNumber, status) => {
    setRooms(prev =>
      prev.map(room =>
        room.roomNumber === roomNumber
          ? { ...room, status }
          : room
      )
    );
  };

  const addRoom = (roomData) => {
    const newRoom = {
      id: Math.max(...rooms.map(r => r.id), 0) + 1,
      ...roomData,
      status: 'available'
    };
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  };

  const updateRoom = (roomId, updates) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, ...updates }
          : room
      )
    );
  };

  const deleteRoom = (roomId) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
  };

  const getRoomOccupancy = () => {
    const total = rooms.length;
    const occupied = rooms.filter(room => room.status === 'occupied').length;
    const available = rooms.filter(room => room.status === 'available').length;
    const maintenance = rooms.filter(room => room.status === 'maintenance').length;
    const reserved = rooms.filter(room => room.status === 'reserved').length;

    return {
      total,
      occupied,
      available,
      maintenance,
      reserved,
      occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(1) : 0
    };
  };

  const getRoomsByType = () => {
    const grouped = rooms.reduce((acc, room) => {
      if (!acc[room.type]) {
        acc[room.type] = [];
      }
      acc[room.type].push(room);
      return acc;
    }, {});
    return grouped;
  };

  const value = {
    rooms,
    getAvailableRooms,
    getRoomByNumber,
    updateRoomStatus,
    addRoom,
    updateRoom,
    deleteRoom,
    getRoomOccupancy,
    getRoomsByType
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
