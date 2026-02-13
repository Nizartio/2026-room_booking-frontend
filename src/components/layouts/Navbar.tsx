import { Link } from "react-router-dom";
import type {Role} from "../../contexts/role-context";
import { useRole } from "../../contexts/useRole";

function Navbar() {
  const { role, setRole } = useRole();

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
      {/* Left */}
      <div className="flex items-center gap-6">
        <Link
          to="/"
          className="text-lg font-bold text-blue-600"
        >
          RoomBooking
        </Link>

        {role === "Customer" && (
          <>
            <Link
              to="/booking"
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              Create Booking
            </Link>

            <Link
              to="/my-bookings"
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              My Bookings
            </Link>
          </>
        )}

        {role === "Admin" && (
          <Link
            to="/admin"
            className="text-sm text-gray-700 hover:text-blue-600"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Role:
        </span>

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as Role)
          }
          className="border rounded-md px-2 py-1 text-sm"
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
