import { NavLink } from "react-router-dom";
import type { Role } from "../../contexts/role-context";
import { useRole } from "../../contexts/useRole";

function Navbar() {
  const { role, setRole } = useRole();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-2 rounded-md transition border-b-2 ${
      isActive
        ? "bg-rose-500 text-white border-yellow-400 shadow-md"
        : "text-black hover:bg-sky-100 border-b-2 border-transparent"
    }`;

  return (
    <nav className="bg-sky-50 border-b border-yellow-300 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      
      {/* LEFT */}
      <div className="flex items-center gap-6">
        <NavLink
          to="/customers/my-bookings"
          className="text-lg font-bold text-rose-500"
        >
          PinjamIn
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
        <span className="text-sm text-black">
          Role:
        </span>

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as Role)
          }
          className="border border-yellow-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
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