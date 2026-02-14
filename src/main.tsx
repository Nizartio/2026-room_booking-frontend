import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
import { RoleProvider } from "./contexts/RoleProvider.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RoleProvider>
      <Toaster position="top-right" />
      <App />
    </RoleProvider>
  </React.StrictMode>
);