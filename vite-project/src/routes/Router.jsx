import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PvBot from "../pages/PvBot";
import Home from "../pages/Home";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SignIn from "../pages/SignIn";
import SignUp from "./../pages/SignUp";

const Router = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pvbot" element={<PvBot />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default Router;
