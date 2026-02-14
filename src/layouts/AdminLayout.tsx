import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/layouts/AdminNavbar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="max-w-6xl mx-auto py-8 px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;