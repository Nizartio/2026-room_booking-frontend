import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/layouts/CustomerNavbar";

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      <main className="max-w-6xl mx-auto py-8 px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;