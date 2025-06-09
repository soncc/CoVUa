import React from "react";
import ChessBoardBot from "../components/ChessBoardBot";

const PvBot = () => {
  return (
    <div className="justify-center text-center items-center mx-auto my-1">
      <h1 className="text-5xl text-blue-300">đấu với BOT </h1>

      <ChessBoardBot />
    </div>
  );
};

export default PvBot;
