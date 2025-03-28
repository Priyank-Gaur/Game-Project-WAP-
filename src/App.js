import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = 0;
  const PLAYER_1 = 1;
  const PLAYER_2 = 2;

  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sound effects
  const dropSound = useRef(new Audio('/sounds/drop.mp3'));
  const winSound = useRef(new Audio('/sounds/win.mp3'));
  const drawSound = useRef(new Audio('/sounds/draw.mp3'));
  const errorSound = useRef(new Audio('/sounds/error.mp3'));

  const playSound = (soundRef) => {
    soundRef.current.currentTime = 0;
    soundRef.current.play().catch(e => console.log("Audio play failed:", e));
  };

  const checkWinner = (row, col) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    return directions.some(([dx, dy]) => {
      let count = 1;

      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && 
            board[newRow][newCol] === currentPlayer) {
          count++;
        } else break;
      }

      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && 
            board[newRow][newCol] === currentPlayer) {
          count++;
        } else break;
      }

      return count >= 4;
    });
  };

  const checkDraw = () => board.every(row => row.every(cell => cell !== EMPTY));

  const handleClick = (col) => {
    if (gameOver) {
      setErrorMessage("Game over! Please reset to play again.");
      playSound(errorSound);
      return;
    }

    // Find bottom-most empty row
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === EMPTY) {
        row = r;
        break;
      }
    }

    if (row === -1) {
      setErrorMessage("This column is full! Try another one.");
      playSound(errorSound);
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    // Update board
    const newBoard = [...board];
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setErrorMessage('');
    playSound(dropSound);

    // Check game state
    if (checkWinner(row, col)) {
      setWinner(currentPlayer);
      setGameOver(true);
      playSound(winSound);
    } else if (checkDraw()) {
      setGameOver(true);
      playSound(drawSound);
    } else {
      setCurrentPlayer(currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    setCurrentPlayer(PLAYER_1);
    setWinner(null);
    setGameOver(false);
    setErrorMessage('');
  };

  const toggleInstructions = () => setShowInstructions(!showInstructions);

  return (
    <div className="app">
      <h1>Connect Four</h1>
      
      <div className="game-info">
        {!gameOver ? (
          <p>Current Player: <span className="player-text">
            Player {currentPlayer}
          </span></p>
        ) : winner ? (
          <p className="winner-message">
            <span className="player-text">Player {winner}</span> wins!
          </p>
        ) : (
          <p className="draw-message">Game ended in a draw!</p>
        )}
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="board-container">
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`cell ${cell === EMPTY ? 'empty' : 
                              cell === PLAYER_1 ? 'player-1' : 'player-2'}`}
                  onClick={() => handleClick(colIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {showInstructions && (
        <div className="instructions-modal">
          <div className="instructions-content">
            <h2>How to Play Connect Four</h2>
            <ol>
              <li>Players take turns dropping their colored discs into columns</li>
              <li>The disc falls to the lowest available space</li>
              <li>First to get 4 discs in a row (horizontally, vertically, or diagonally) wins</li>
              <li>Game ends in a draw if the board fills up</li>
              <li>Player 1: <span className="player-1">Red</span>, Player 2: <span className="player-2">Yellow</span></li>
            </ol>
            <button className="close-button" onClick={toggleInstructions}>
              Got it!
            </button>
          </div>
        </div>
      )}

      <div className="button-container">
        <button className="action-button how-to-play" onClick={toggleInstructions}>
          How to Play
        </button>
        <button className="action-button reset" onClick={resetGame}>
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default App;