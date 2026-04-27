import React, { createContext, useContext, useState, useEffect } from 'react';

interface GameState {
  score: number;
  hintsUsed: number;
  startTime: number | null;
  endTime: number | null;
}

interface GameContextType {
  state: GameState;
  startGame: () => void;
  useHint: () => void;
  endGame: () => { finalScore: number; grade: string; timeTaken: number };
  resetGame: () => void;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

// Helper to determine grade based on final score
function calculateGrade(score: number): string {
  if (score >= 1200) return 'S';
  if (score >= 1000) return 'A+';
  if (score >= 900) return 'A';
  if (score >= 800) return 'B';
  if (score >= 700) return 'C';
  return 'F';
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    score: 1000,
    hintsUsed: 0,
    startTime: null,
    endTime: null,
  });

  const startGame = () => {
    setState({
      score: 1000,
      hintsUsed: 0,
      startTime: Date.now(),
      endTime: null,
    });
  };

  const useHint = () => {
    setState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      score: Math.max(0, prev.score - 100), // Deduct 100 points per hint
    }));
  };

  const endGame = () => {
    const endTime = Date.now();
    const timeTaken = state.startTime ? Math.floor((endTime - state.startTime) / 1000) : 0;
    
    // Time bonus: 300 points if finished within 3 minutes (180s), decreasing to 0 at 8 minutes (480s)
    let timeBonus = 0;
    if (timeTaken <= 180) {
      timeBonus = 300;
    } else if (timeTaken < 480) {
      timeBonus = 300 - Math.floor(((timeTaken - 180) / 300) * 300);
    }

    const finalScore = state.score + Math.max(0, timeBonus);
    const grade = calculateGrade(finalScore);

    setState(prev => ({ ...prev, endTime, score: finalScore }));

    return { finalScore, grade, timeTaken };
  };

  const resetGame = () => {
    setState({
      score: 1000,
      hintsUsed: 0,
      startTime: null,
      endTime: null,
    });
  };

  return (
    <GameContext.Provider value={{ state, startGame, useHint, endGame, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
