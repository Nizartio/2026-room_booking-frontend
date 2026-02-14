import { Outlet } from "react-router-dom";
import Navbar from "../layouts/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-sky-500">
      <Navbar />

      <main className="max-w-6xl mx-auto py-8 px-6">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;