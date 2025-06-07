import React, { useEffect, useState } from 'react';
import targetImg from '../assets/target.png';
import bombImg from '../assets/bomb.png';
import heartImg from '../assets/heart.png';
import '../App.css';

type FallingItem = {
  id: number;
  type: 'target' | 'bomb';
  x: number;
  y: number;
};

type ScoreEntry = {
  playerName: string;
  score: number;
};

let idCounter = 0;

const Game: React.FC = () => {
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [hearts, setHearts] = useState<number>(3);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [speed, setSpeed] = useState<number>(2);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);

  // Move falling items
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setFallingItems(items =>
        items
          .map(item => ({ ...item, y: item.y + speed }))
          .filter(item => {
            if (item.y > window.innerHeight - 50) {
              if (item.type === 'target') {
                setHearts(prev => prev - 1);
              }
              // Bombs are just removed silently
              return false;
            }
            return true;
          })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, speed]);

  // Spawn new items
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawner = setInterval(() => {
      setFallingItems(items => {
        if (items.length >= 3) return items;

        const newItem: FallingItem = {
          id: idCounter++,
          type: Math.random() > 0.2 ? 'target' : 'bomb',
          x: Math.random() * (window.innerWidth - 50),
          y: 0,
        };

        return [...items, newItem];
      });
    }, 1000);

    return () => clearInterval(spawner);
  }, [gameStarted, gameOver]);

  // Increase speed every 10 points
  useEffect(() => {
    const newSpeed = 2 + Math.floor(score / 10) * 0.5;
    if (newSpeed <= 8) {
      setSpeed(newSpeed);
    }
  }, [score]);

  // Game over logic
  useEffect(() => {
    if (hearts <= 0) {
      setGameOver(true);
      setGameStarted(false);
      fetchLeaderboard();
    }
  }, [hearts]);

  const handleClick = (id: number, type: 'target' | 'bomb') => {
    setFallingItems(items => items.filter(item => item.id !== id));

    if (type === 'target') {
      setScore(prev => prev + 1);
    } else {
      setHearts(prev => prev - 1);
    }
  };

  const handleSubmitScore = async () => {
    if (!playerName) return;

    try {
      await fetch('https://falling-game-f14a450e5777.herokuapp.com/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, score }),
      });
      alert('Score saved!');
      fetchLeaderboard();
    } catch (err) {
      alert('Failed to save score.');
    }

    setScore(0);
    setHearts(3);
    setFallingItems([]);
    setGameOver(false);
    setPlayerName('');
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('https://falling-game-f14a450e5777.herokuapp.com/api/scores/top5');
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setHearts(3);
    setFallingItems([]);
    setSpeed(2);
  };

  return (
    <div className="container">
      {!gameStarted && !gameOver && (
        <button className="start-button" onClick={handleStart}>
          Start Game
        </button>
      )}

      {gameOver && (
        <div className="game-over">
          <p>Game Over! Your score: {score}</p>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
          />
          <button onClick={handleSubmitScore}>Submit Score</button>

          <div className="leaderboard">
            <h3>🏆 Top 5 Leaderboard</h3>
            <ul>
              {leaderboard.map((entry, index) => (
                <li key={index}>
                  {entry.playerName}: {entry.score}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {gameStarted && (
        <>
          <h2>Score: {score}</h2>
          <div className="hearts">
            {[...Array(Math.max(0, hearts))].map((_, i) => (
              <img key={i} src={heartImg} alt="heart" width={30} />
            ))}
          </div>

          {fallingItems.map(item => (
            <img
              key={item.id}
              src={item.type === 'target' ? targetImg : bombImg}
              className="falling"
              style={{ top: item.y, left: item.x }}
              onClick={() => handleClick(item.id, item.type)}
              alt={item.type}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Game;
