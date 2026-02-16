import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

import CreateBookingPage from "./pages/CreateBookingsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminCustomerPage from "./pages/AdminCustomerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/customers/my-bookings" />} />

        {/* CUSTOMER ROUTES */}
        <Route path="/customers" element={<CustomerLayout />}>
          <Route path="booking" element={<CreateBookingPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="customers" element={<AdminCustomerPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;