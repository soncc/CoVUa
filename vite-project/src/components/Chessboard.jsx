import React, { useState } from "react";
import { Chess } from "chess.js";

const Chessboard = () => {
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
  const board = game.board();

  const pieceToImg = (piece) => {
    if (!piece) return null;
    return `/pieces/${piece.color}${piece.type}.png`;
  };

  // Xử lý khi bắt đầu kéo
  const handleDragStart = (e, file, rank) => {
    const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
    const piece = game.get(square);

    if (piece && piece.color === game.turn()) {
      setDraggedPiece(piece);
      setDraggedFrom(square);
      setSelectedSquare(square);
      const moves = game.moves({ square: square, verbose: true });
      setValidMoves(moves);

      // Tạo ghost image trong suốt
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
      // Thả lại chỗ cũ
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
    const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
    const piece = game.get(square);

    // Nếu click lại chính ô đang chọn → hủy chọn
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // Nếu đã chọn một quân cờ rồi
    if (selectedSquare) {
      const selectedPiece = game.get(selectedSquare);

      // Nếu quân vừa click cùng màu với quân đã chọn → đổi chọn
      if (piece && selectedPiece && piece.color === selectedPiece.color) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square, verbose: true });
        setValidMoves(moves);
        return;
      }

      // Thử di chuyển
      const move = { from: selectedSquare, to: square, promotion: "q" };
      const result = game.move(move);

      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setGameHistory((prev) => [...prev, newGame.fen()]);
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // Không đi được → kiểm tra nếu click vào quân hợp lệ thì chọn lại
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
      // Nếu chưa chọn gì → chọn nếu là quân đúng lượt
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square: square, verbose: true });
        setValidMoves(moves);
      }
    }
  };

  // Hàm undo
  const handleUndo = () => {
    if (gameHistory.length > 1) {
      const newHistory = [...gameHistory];
      newHistory.pop();
      const previousFen = newHistory[newHistory.length - 1];

      setGame(new Chess(previousFen));
      setGameHistory(newHistory);
      setSelectedSquare(null);
      setValidMoves([]);
    }
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

  // Xử lý click ra ngoài để bỏ chọn
  const handleOutsideClick = () => {
    setSelectedSquare(null);
    setValidMoves([]);
  };

  return (
    <div
      className="flex flex-col items-center p-8 bg-gray-100 min-h-screen"
      onClick={handleOutsideClick}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Cờ Vua</h1>

      {/* Thông tin lượt đi */}
      <div className="mb-4 text-lg font-semibold">
        Lượt: {game.turn() === "w" ? "Trắng" : "Đen"}
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

                return (
                  <div
                    key={square}
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn event bubble lên parent
                      handleSquareClick(file, rank);
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, file, rank)}
                    className={`w-16 h-16 flex items-center justify-center cursor-pointer relative transition-all duration-200 hover:brightness-110 ${squareColor} ${additionalClasses}`}
                  >
                    {/* Hình ảnh quân cờ */}
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={`${piece.color}${piece.type}`}
                        className={`w-12 h-12 z-10 ${
                          piece && piece.color === game.turn()
                            ? "cursor-move"
                            : "cursor-pointer"
                        }`}
                        draggable={piece && piece.color === game.turn()}
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
          disabled={gameHistory.length <= 1}
          className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
            gameHistory.length <= 1
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
        >
          Undo ({gameHistory.length - 1})
        </button>

        <button
          onClick={() => {
            setGame(new Chess());
            setSelectedSquare(null);
            setValidMoves([]);
            setGameHistory([new Chess().fen()]);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Ván mới
        </button>
      </div>
    </div>
  );
};

export default Chessboard;
