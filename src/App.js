import React from "react";
import { Routes, Route } from "react-router-dom";
import "rsuite/dist/rsuite.min.css";

import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { ProfileProvider } from "./context/profile.context";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import LandingPage from "./pages/LandingPage";
import "./styles/main.scss";

function App() {
  return (
    <ProfileProvider>
      <Routes>
        <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat/*" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </ProfileProvider>
  );
}

export default App;
