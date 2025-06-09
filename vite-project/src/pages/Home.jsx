import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-147 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white px-4">
      {/* Optional Header */}
      {/* <Header /> */}

      <div className="text-center max-w-xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          ♟️ Chào mừng đến với Thế giới Cờ Vua Online ♟️
        </h1>
        <p className="text-lg md:text-xl mb-6 italic opacity-90">
          Thách đấu, học hỏi và chinh phục đỉnh cao trí tuệ!
        </p>

        <Link to="/pvbot">
          <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-lg px-6 py-3 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105">
            🚀 BẮT ĐẦU
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
