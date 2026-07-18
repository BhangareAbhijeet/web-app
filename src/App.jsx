import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import "./App.css"
import LanguageSelection from "./pages/LanguageSelection";
import Contacts from "./components/Contacts";
import ChatSection from "./pages/ChatSection";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import SelectionPage from "./pages/SelectionPage";
import Profile from "./pages/Profile";
import ContactInfo from "./pages/ContactInfo";
import Calls from "./pages/Calls";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LanguageSelection />} />
        <Route path="/messages" element={<ChatSection />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/calls" element={<Calls  />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/selectionpage" element={<SelectionPage />} />
        <Route path="/contactinfo/:id" element={<ContactInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
