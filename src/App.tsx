import { Routes, Route } from "react-router-dom";
import BookingPage from "./pages/BookingPage";
import "react-datepicker/dist/react-datepicker.css";



function App() {
  
  return (
    <Routes>
      <Route path="/" element={<BookingPage />} />
    </Routes>
  );
}

export default App;
