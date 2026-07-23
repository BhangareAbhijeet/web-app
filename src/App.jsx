import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import LanguageSelection from "./pages/LanguageSelection";
import SelectionPage from "./pages/SelectionPage";
import MainLayout from "./components/MainLayout";
import ChatPage from "./pages/ChatPage";
import Contacts from "./pages/Contacts";
import Calls from "./pages/Calls";
import Profile from "./pages/Profile";
import ContactInfo from "./pages/ContactInfo";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages WITHOUT Sidebar */}
        <Route path="/" element={<LanguageSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/selectionpage" element={<SelectionPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
     
        {/* Pages WITH Sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/messages" element={<ChatPage />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/calls" element={<Calls />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contactinfo/:id" element={<ContactInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
