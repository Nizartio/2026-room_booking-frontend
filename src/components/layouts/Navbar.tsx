import { NavLink } from "react-router-dom";
import type { Role } from "../../contexts/role-context";
import { useRole } from "../../contexts/useRole";

function Navbar() {
  const { role, setRole } = useRole();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-2 rounded-md transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
      
      {/* LEFT */}
      <div className="flex items-center gap-6">
        <NavLink
          to="/customers/my-bookings"
          className="text-lg font-bold text-blue-600"
        >
          RoomBooking
        </NavLink>

        {role === "Customer" && (
          <>
            <NavLink
              to="/customers/booking"
              className={linkClass}
            >
              Create Booking
            </NavLink>

            <NavLink
              to="/customers/my-bookings"
              className={linkClass}
            >
              My Bookings
            </NavLink>
          </>
        )}

        {role === "Admin" && (
          <NavLink
            to="/admin/bookings"
            className={linkClass}
          >
            Admin Panel
          </NavLink>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Role:
        </span>

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as Role)
          }
          className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Customer">
            Customer
          </option>
          <option value="Admin">
            Admin
          </option>
        </select>
      </div>
    </nav>
  );
}

export default Navbar;