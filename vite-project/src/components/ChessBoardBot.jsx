import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";

const ChessBoardBot = () => {
  const size = 8;
  const ranks = [];
  const files = [];

  for (let i = size; i >= 1; i--) {
    ranks.push(i);
  }

  for (let i = "a".charCodeAt(); i <= "h".charCodeAt(); i++) {
    files.push(String.fromCharCode(i));
  }

  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [gameHistory, setGameHistory] = useState([new Chess().fen()]);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [gameMode, setGameMode] = useState("2players"); // "2players" hoặc "vsbot"
  const [playerColor, setPlayerColor] = useState("w"); // "w" cho trắng, "b" cho đen
  const [isThinking, setIsThinking] = useState(false);
  const board = game.board();

  const pieceToImg = (piece) => {
    if (!piece) return null;
    return `/pieces/${piece.color}${piece.type}.png`;
  };

  // Đánh giá vị trí quân cờ
  const pieceValues = {
    p: 100, // pawn
    n: 320, // knight
    b: 330, // bishop
    r: 500, // rook
    q: 900, // queen
    k: 20000, // king
  };

  // Bảng vị trí cho từng loại quân
  const pieceSquareTables = {
    p: [
      // pawn
      [0, 0, 0, 0, 0, 0, 0, 0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [5, 10, 10, -20, -20, 10, 10, 5],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    n: [
      // knight
      [-50, -40, -30, -30, -30, -30, -40, -50],
      [-40, -20, 0, 0, 0, 0, -20, -40],
      [-30, 0, 10, 15, 15, 10, 0, -30],
      [-30, 5, 15, 20, 20, 15, 5, -30],
      [-30, 0, 15, 20, 20, 15, 0, -30],
      [-30, 5, 10, 15, 15, 10, 5, -30],
      [-40, -20, 0, 5, 5, 0, -20, -40],
      [-50, -40, -30, -30, -30, -30, -40, -50],
    ],
    b: [
      // bishop
      [-20, -10, -10, -10, -10, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 5, 10, 10, 5, 0, -10],
      [-10, 5, 5, 10, 10, 5, 5, -10],
      [-10, 0, 10, 10, 10, 10, 0, -10],
      [-10, 10, 10, 10, 10, 10, 10, -10],
      [-10, 5, 0, 0, 0, 0, 5, -10],
      [-20, -10, -10, -10, -10, -10, -10, -20],
    ],
    r: [
      // rook
      [0, 0, 0, 0, 0, 0, 0, 0],
      [5, 10, 10, 10, 10, 10, 10, 5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [0, 0, 0, 5, 5, 0, 0, 0],
    ],
    q: [
      // queen
      [-20, -10, -10, -5, -5, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 5, 5, 5, 5, 0, -10],
      [-5, 0, 5, 5, 5, 5, 0, -5],
      [0, 0, 5, 5, 5, 5, 0, -5],
      [-10, 5, 5, 5, 5, 5, 0, -10],
      [-10, 0, 5, 0, 0, 0, 0, -10],
      [-20, -10, -10, -5, -5, -10, -10, -20],
    ],
    k: [
      // king
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-20, -30, -30, -40, -40, -30, -30, -20],
      [-10, -20, -20, -20, -20, -20, -20, -10],
      [20, 20, 0, 0, 0, 0, 20, 20],
      [20, 30, 10, 0, 0, 10, 30, 20],
    ],
  };

  // Đánh giá vị trí
  const evaluateBoard = (chess) => {
    let score = 0;
    const board = chess.board();

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const isWhite = piece.color === "w";
          const pieceValue = pieceValues[piece.type];
          const positionValue =
            pieceSquareTables[piece.type][isWhite ? rank : 7 - rank][file];

          const totalValue = pieceValue + positionValue;
          score += isWhite ? totalValue : -totalValue;
        }
      }
    }

    return score;
  };

  // Thuật toán Minimax với Alpha-Beta Pruning
  const minimax = (chess, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || chess.isGameOver()) {
      return evaluateBoard(chess);
    }

    const moves = chess.moves();

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const tempChess = new Chess(chess.fen());
        tempChess.move(move);
        const eval_ = minimax(tempChess, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const tempChess = new Chess(chess.fen());
        tempChess.move(move);
        const eval_ = minimax(tempChess, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  };

  // Tìm nước đi tốt nhất cho bot
  const getBestMove = (chess, depth = 3) => {
    const moves = chess.moves();
    let bestMove = null;
    let bestValue = playerColor === "w" ? Infinity : -Infinity;

    for (const move of moves) {
      const tempChess = new Chess(chess.fen());
      tempChess.move(move);

      const value = minimax(
        tempChess,
        depth - 1,
        -Infinity,
        Infinity,
        playerColor === "w" // Bot sẽ maximize nếu là đen, minimize nếu là trắng
      );

      if (playerColor === "w" && value < bestValue) {
        bestValue = value;
        bestMove = move;
      } else if (playerColor === "b" && value > bestValue) {
        bestValue = value;
        bestMove = move;
      }
    }

    return bestMove;
  };

  // Effect để bot tự động đi khi đến lượt
  useEffect(() => {
    if (
      gameMode === "vsbot" &&
      game.turn() !== playerColor &&
      !game.isGameOver()
    ) {
      setIsThinking(true);

      // Delay một chút để tạo cảm giác bot đang "suy nghĩ"
      const timer = setTimeout(() => {
        const bestMove = getBestMove(game);
        if (bestMove) {
          const result = game.move(bestMove);
          if (result) {
            const newGame = new Chess(game.fen());
            setGame(newGame);
            setGameHistory((prev) => [...prev, newGame.fen()]);
            setSelectedSquare(null);
            setValidMoves([]);
          }
        }
        setIsThinking(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [game.fen(), gameMode, playerColor]);

  // Xử lý khi bắt đầu kéo
  const handleDragStart = (e, file, rank) => {
    if (gameMode === "vsbot" && game.turn() !== playerColor) {
      e.preventDefault();
      return;
    }

    const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
    const piece = game.get(square);

    if (piece && piece.color === game.turn()) {
      setDraggedPiece(piece);
      setDraggedFrom(square);
      setSelectedSquare(square);
      const moves = game.moves({ square: square, verbose: true });
      setValidMoves(moves);

      const img = new Image();
      img.src = pieceToImg(piece);
      e.dataTransfer.setDragImage(img, 24, 24);
    } else {
      e.preventDefault();
    }
  };

  // Xử lý khi kéo qua ô khác
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Xử lý khi thả
  const handleDrop = (e, file, rank) => {
    e.preventDefault();

    if (!draggedFrom) return;

    const toSquare = `${String.fromCharCode(97 + file)}${8 - rank}`;

    if (draggedFrom === toSquare) {
      setDraggedPiece(null);
      setDraggedFrom(null);
      return;
    }

    const move = { from: draggedFrom, to: toSquare, promotion: "q" };
    const result = game.move(move);

    if (result) {
      const newGame = new Chess(game.fen());
      setGame(newGame);
      setGameHistory((prev) => [...prev, newGame.fen()]);
      setSelectedSquare(null);
      setValidMoves([]);
    }

    setDraggedPiece(null);
    setDraggedFrom(null);
  };

  // Xử lý khi kết thúc kéo
  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDraggedFrom(null);
  };

  const handleSquareClick = (file, rank) => {
    if (gameMode === "vsbot" && game.turn() !== playerColor) {
      return; // Không cho phép di chuyển khi không phải lượt của người chơi
    }

    const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
    const piece = game.get(square);

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    if (selectedSquare) {
      const selectedPiece = game.get(selectedSquare);

      if (piece && selectedPiece && piece.color === selectedPiece.color) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square, verbose: true });
        setValidMoves(moves);
        return;
      }

      const move = { from: selectedSquare, to: square, promotion: "q" };
      const result = game.move(move);

      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setGameHistory((prev) => [...prev, newGame.fen()]);
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const moves = game.moves({ square: square, verbose: true });
          setValidMoves(moves);
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square, verbose: true });
        setValidMoves(moves);
      }
    }
  };

  // Xử lý click ra ngoài để bỏ chọn
  const handleOutsideClick = () => {
    setSelectedSquare(null);
    setValidMoves([]);
  };

  // Hàm undo
  const handleUndo = () => {
    if (gameHistory.length > 1) {
      let newHistory = [...gameHistory];

      // Nếu đang chơi với bot, undo 2 nước (của người và bot)
      if (gameMode === "vsbot" && newHistory.length > 2) {
        newHistory.pop(); // Xóa nước của bot
        newHistory.pop(); // Xóa nước của người chơi
      } else {
        newHistory.pop();
      }

      const previousFen = newHistory[newHistory.length - 1];
      setGame(new Chess(previousFen));
      setGameHistory(newHistory);
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Reset game
  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setSelectedSquare(null);
    setValidMoves([]);
    setGameHistory([newGame.fen()]);
    setIsThinking(false);
  };

  // Chuyển đổi chế độ chơi
  const switchGameMode = (mode) => {
    setGameMode(mode);
    resetGame();
  };

  // Kiểm tra ô có phải nước đi hợp lệ không
  const isValidMove = (square) => {
    return validMoves.some((move) => move.to === square);
  };

  // Kiểm tra ô có phải nước ăn quân không
  const isCaptureMove = (square) => {
    const move = validMoves.find((move) => move.to === square);
    return move && move.captured;
  };

  const getCurrentPlayerName = () => {
    if (gameMode === "2players") {
      return game.turn() === "w" ? "Trắng" : "Đen";
    } else {
      if (game.turn() === playerColor) {
        return "Bạn";
      } else {
        return "Bot";
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center p-8 bg-gray-100 min-h-screen"
      onClick={handleOutsideClick}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Cờ Vua</h1>

      {/* Chọn chế độ chơi */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => switchGameMode("2players")}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            gameMode === "2players"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          2 Người chơi
        </button>
        <button
          onClick={() => switchGameMode("vsbot")}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            gameMode === "vsbot"
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          Đấu với Bot
        </button>
      </div>

      {/* Chọn màu khi chơi với bot */}
      {gameMode === "vsbot" && (
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => {
              setPlayerColor("w");
              resetGame();
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              playerColor === "w"
                ? "bg-white text-black border-2 border-gray-600"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            Chơi Trắng
          </button>
          <button
            onClick={() => {
              setPlayerColor("b");
              resetGame();
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              playerColor === "b"
                ? "bg-gray-800 text-white"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            Chơi Đen
          </button>
        </div>
      )}

      {/* Thông tin lượt đi */}
      <div className="mb-4 text-lg font-semibold flex items-center gap-2">
        <span>Lượt: {getCurrentPlayerName()}</span>
        {isThinking && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600">Bot đang suy nghĩ...</span>
          </div>
        )}
      </div>

      {/* Hướng dẫn */}
      <div className="mb-4 text-sm text-gray-600 text-center">
        <p>Kéo thả hoặc click để di chuyển quân cờ</p>
      </div>

      <div className="relative">
        {/* Tọa độ cột (a-h) */}
        <div className="flex ml-8 mb-1">
          {files.map((file, index) => (
            <div
              key={index}
              className="w-16 h-6 flex items-center justify-center text-sm font-bold text-gray-600"
            >
              {file}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Tọa độ hàng (1-8) */}
          <div className="flex flex-col mr-1">
            {ranks.map((rank, index) => (
              <div
                key={index}
                className="w-6 h-16 flex items-center justify-center text-sm font-bold text-gray-600"
              >
                {rank}
              </div>
            ))}
          </div>

          {/* Bàn cờ */}
          <div className="grid grid-cols-8 border-4 border-gray-800 rounded-lg overflow-hidden shadow-lg">
            {board.map((row, rank) =>
              row.map((piece, file) => {
                const squareColor =
                  (rank + file) % 2 === 0 ? "bg-amber-100" : "bg-amber-600";
                const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
                const isSelected = selectedSquare === square;
                const isValid = isValidMove(square);
                const isCapture = isCaptureMove(square);
                const isDraggedFrom = draggedFrom === square;
                const imgSrc = pieceToImg(piece);

                let additionalClasses = "";
                if (isSelected) {
                  additionalClasses += " ring-4 ring-yellow-400 ring-inset";
                }
                if (isDraggedFrom) {
                  additionalClasses += " opacity-50";
                }
                if (isValid) {
                  additionalClasses += " bg-opacity-80";
                }

                const canInteract =
                  gameMode === "2players" || game.turn() === playerColor;

                return (
                  <div
                    key={square}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canInteract) handleSquareClick(file, rank);
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, file, rank)}
                    className={`w-16 h-16 flex items-center justify-center ${
                      canInteract ? "cursor-pointer" : "cursor-not-allowed"
                    } relative transition-all duration-200 hover:brightness-110 ${squareColor} ${additionalClasses}`}
                  >
                    {/* Hình ảnh quân cờ */}
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={`${piece.color}${piece.type}`}
                        className={`w-12 h-12 z-10 ${
                          canInteract && piece && piece.color === game.turn()
                            ? "cursor-move"
                            : "cursor-pointer"
                        }`}
                        draggable={
                          canInteract && piece && piece.color === game.turn()
                        }
                        onDragStart={(e) => handleDragStart(e, file, rank)}
                        onDragEnd={handleDragEnd}
                      />
                    )}

                    {/* Gợi ý nước đi */}
                    {isValid && !piece && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 bg-green-500 rounded-full opacity-70"></div>
                      </div>
                    )}

                    {/* Gợi ý ăn quân */}
                    {isCapture && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-full border-4 border-red-500 rounded-full opacity-70"></div>
                      </div>
                    )}

                    {/* Gợi ý nước đi thường khi có quân */}
                    {isValid && piece && !isCapture && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 bg-blue-500 rounded-full opacity-70"></div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Thông tin trạng thái game */}
      <div className="mt-6 text-center">
        {game.inCheck() && (
          <div className="text-red-600 font-bold text-lg mb-2">
            Chiếu tướng!
          </div>
        )}
        {game.isCheckmate() && (
          <div className="text-red-800 font-bold text-xl">
            Chiếu bí! {game.turn() === "w" ? "Đen" : "Trắng"} thắng!
          </div>
        )}
        {game.isDraw() && (
          <div className="text-gray-600 font-bold text-xl">Hòa!</div>
        )}
      </div>

      {/* Nút reset và undo */}
      <div className="flex gap-4 mt-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleUndo}
          disabled={gameHistory.length <= 1 || isThinking}
          className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
            gameHistory.length <= 1 || isThinking
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
        >
          Undo ({Math.max(0, gameHistory.length - 1)})
        </button>

        <button
          onClick={resetGame}
          disabled={isThinking}
          className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
            isThinking
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Ván mới
        </button>
      </div>
    </div>
  );
};

export default ChessBoardBot;
