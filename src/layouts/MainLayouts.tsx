import { Link } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

function MainLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          <div className="font-bold text-blue-600">
            RoomBooking
          </div>

          <div className="flex gap-6 text-sm">
            <Link to="/" className="hover:text-blue-600">
              My Bookings
            </Link>
            <Link to="/admin" className="hover:text-blue-600">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="py-8">
        {children}
      </div>

    </div>
  );
}

export default MainLayout;
