import { NavLink } from "react-router-dom";

function CustomerNavbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-2 rounded-md transition border-b-2 ${
      isActive
        ? "bg-rose-500 text-white border-yellow-400 shadow-md"
        : "text-black hover:bg-sky-100 border-b-2 border-transparent"
    }`;

  return (
    <nav className="bg-sky-50 border-b border-yellow-300 shadow-sm px-6 py-4 flex gap-6 sticky top-0 z-40 items-center">
      <NavLink to="/customers/booking" className="text-lg font-bold text-rose-500">
        PinjamIn
      </NavLink>

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