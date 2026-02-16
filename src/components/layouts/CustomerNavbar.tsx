import { Link } from "react-router-dom";

function CustomerNavbar() {
  return (
    <nav className="bg-sky-50 border-b border-yellow-300 shadow-sm px-6 py-4 flex gap-6 sticky top-0 z-40 items-center">
      <Link to="/customers/my-bookings" className="text-lg font-bold text-rose-500">
        PinjamIn
      </Link>
    </nav>
  );
}

export default CustomerNavbar;