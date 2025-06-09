import React from "react";

const Footer = () => {
  return (
    <div className="w-full py-7 bg-black flex justify-center items-center">
      <p
        className="text-3xl md:text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-300 to-red-600 animate-pulse drop-shadow-lg"
        style={{ animation: "shake 0.4s infinite alternate" }}
      >
        NÓI GÌ ĐI THẰNG NGU ĐỊNH
      </p>

      {/* Custom animation (shake) */}
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            50% { transform: translateX(2px); }
            75% { transform: translateX(-2px); }
            100% { transform: translateX(2px); }
          }
        `}
      </style>
    </div>
  );
};

export default Footer;
