/* jshint esversion:11 */

import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";

// Adjust the import path as necessary
import { db, auth } from "../../../firebase";
// AuthContext.jsx
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  const [bookingsCheckInData, setBookingsCheckIn] = useState([]);
  const [bookingsCheckOutData, setBookingsCheckOut] = useState([]);
  console.log(user?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        console.log('UID:', firebaseUser.uid);
        setUser(firebaseUser);               // store full user object
        setLoading(false);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setLoading(false);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const authStatus = localStorage.getItem('hotelAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const bookingsCheckIn = async (fieldname = 'uid', fieldValue = user?.uid) => {
    try {
      if (!user?.uid) {
        console.warn('No user UID found.');
        return;
      }
      const bookingsRef = collection(db, 'bookingsCheckIn');

      const q = query(bookingsRef, where(fieldname, '==', fieldValue));

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookingsCheckIn(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching filtered bookings:', error);
      setLoading(false);
    }
  };


  const bookingsCheckOut = async (fieldname = 'uid', fieldValue = user?.uid) => {
    try {
      if (!user?.uid) {
        console.warn('No user UID found.');
        return;
      }
      const bookingsRef = collection(db, 'bookingsCheckOut');

      const q = query(bookingsRef, where(fieldname, '==', fieldValue));

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookingsCheckOut(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    bookingsCheckIn();
    bookingsCheckOut()
  }, [user]);

  const updateBookingField = async (bookingId, fieldValue, updatedFields) => {
    try {
      // Step 1: Query to find the document
      const q = query(collection(db, 'bookingsCheckIn'), where(bookingId, '==', fieldValue));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No document found with the given field value.');
        return;
      }

      // Step 2: Loop through matching documents and update them
      querySnapshot.forEach(async (document) => {
        const docRef = doc(db, 'bookingsCheckIn', document.id);
        await updateDoc(docRef, updatedFields);
        bookingsCheckIn();
        bookingsCheckOut();
        // console.log(`Updated document with ID: ${document.id}`);
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };




  // new chech-in handle submit and save in firebase
  const handleCheckOut = async (bookingData) => {
    console.log(bookingData);

    try {
      const docRef = await addDoc(collection(db, 'bookingsCheckOut'), bookingData);
      console.log('Booking saved with ID:', docRef.id);
      bookingsCheckIn();
      bookingsCheckOut();
      // alert('Booking successfully created!');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error saving booking. Try again.');
    }
  };

  // new chech-in handleCheckIn and save in firebase
  const handleCheckIn = async (bookingData) => {
    if (bookingData === null) {
      alert('Booking details are required');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'bookingsCheckIn'), bookingData);
      console.log('Booking saved with ID:', docRef.id);
      bookingsCheckIn();
      bookingsCheckOut();
      // alert('Booking successfully created!');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error saving booking. Try again.');
    }
  };


  // delete booking from firebase
  const deleteByField = async (collectionName, fieldName, fieldValue) => {
    try {
      const q = query(collection(db, collectionName), where(fieldName, '==', fieldValue));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No document found to delete');
        return;
      }

      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, collectionName, docSnapshot.id));
        bookingsCheckIn();
        bookingsCheckOut();
        console.log(`Deleted document with ID: ${docSnapshot.id}`);
      });
    } catch (error) {
      console.error('Error deleting documents:', error);
    }
  };

  // const fetchRecords = async () => {
  //   const snapshot = await getDocs(recordsCol);
  //   setRecords(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  // };

  // useEffect(() => {
  //   if (user) fetchRecords();
  // }, [user]);


  // const login = (username, password) => {
  //   const validUsername = import.meta.env.VITE_ADMIN_USERNAME;
  //   const validPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  //   if (username === validUsername && password === validPassword) {
  //     setIsAuthenticated(true);
  //     localStorage.setItem('hotelAdminAuth', 'true');
  //     return { success: true };
  //   } else {
  //     return { success: false, error: 'Invalid credentials' };
  //   }
  // };
  const login = async (email, password) => {
    console.log(email, password);
    setLoading(true);

    setAuthError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      setUser(credential.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {

      let message;
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          message = 'This user account has been disabled.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          break;
        default:
          message = error.code;
      }
      setLoading(false);
      setAuthError(message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // const createooking = async (bookingData) => {
  //   try {
  //     const bookingsCollection = collection(db, 'bookings');
  //     const docRef = await addDoc(bookingsCollection, bookingData);
  //     return { success: true, id: docRef.id };
  //   } catch (error) {
  //     console.error("Error creating booking:", error);
  //     return { success: false, error: error.message };
  //   }
  // };

  // const logout = (email, password) => {
  //   setIsAuthenticated(false);
  //   localStorage.removeItem('hotelAdminAuth');
  // };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading,
    authError,
    user, // Expose the user object
    handleCheckIn,
    handleCheckOut,
    bookingsCheckInData,
    bookingsCheckOutData,
    updateBookingField, deleteByField
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
