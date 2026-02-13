import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { Toaster } from "react-hot-toast";
import { RoleProvider } from "./contexts/RoleProvider.tsx";
import Navbar from "./components/layouts/Navbar.tsx";


import "./index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <RoleProvider>
        <Navbar />
        <App />
      </RoleProvider>
    </BrowserRouter>
  </React.StrictMode>,
)