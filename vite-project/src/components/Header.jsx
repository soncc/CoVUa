import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo + Title */}
      <div className="flex items-center space-x-3">
        <Link to="/">
          <img
            src="/pieces/logo.png"
            alt="Logo"
            className="h-16 w-auto object-contain cursor-pointer"
          />
        </Link>
        <Link to="/">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 cursor-pointer">
            CoVua.TFT
          </h1>
        </Link>
      </div>

      {/* Auth Section */}
      <div className="flex items-center space-x-2">
        {user ? (
          <>
            <span className="text-gray-700 font-semibold">
              👋 Xin chào, {user.name}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/signup">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition">
                Đăng ký
              </button>
            </Link>
            <Link to="/signin">
              <button className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md transition">
                Đăng nhập
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
