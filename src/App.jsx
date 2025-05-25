

import { AuthProvider } from "./components/contexts/AuthContext";
import { BookingProvider } from "./components/contexts/BookingContext";
import { CustomerProvider } from "./components/contexts/CustomerContext";
import { RoomProvider } from "./components/contexts/RoomContext";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <CustomerProvider>
          <BookingProvider>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </BookingProvider>
        </CustomerProvider>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
