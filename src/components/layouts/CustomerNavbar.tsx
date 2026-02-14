import { NavLink } from "react-router-dom";

function CustomerNavbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-2 rounded-md ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex gap-6">
      <NavLink to="/customers/booking" className={linkClass}>
        Create Booking
      </NavLink>

      <NavLink to="/customers/my-bookings" className={linkClass}>
        My Bookings
      </NavLink>
    </nav>
  );
}

export default CustomerNavbar;