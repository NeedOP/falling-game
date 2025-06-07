import React, { useEffect, useState } from 'react';
import { PlayerScore } from '../types';

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    fetch('https://falling-game-f14a450e5777.herokuapp.com/api/scores')
      .then(res => res.json())
      .then(data => setScores(data));
  }, []);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {scores.map((score, i) => (
          <li key={i}>
            {score.playerName}: {score.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
