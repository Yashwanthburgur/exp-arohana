import { useState } from "react";
import { getWinningScore, DEFAULT_WIN_GOAL } from "../engine/scoreEngine.js";

function useScoreSystem({
  // Dynamic winning score. The pre-game Point Goal selector sets this
  // (Sprint 15 / Standard 25 / Marathon 50). Default: Standard (25).
  targetScore = DEFAULT_WIN_GOAL,
}) {
  const [winGoal, setWinGoal] = useState(targetScore);
  const [whiteScore, setWhiteScore] = useState(0);
  const [blackScore, setBlackScore] = useState(0);
  const [winner, setWinner] = useState(null);

  function getScore(color) {
    return color === "WHITE" ? whiteScore : blackScore;
  }

  function getScoreSnapshot(white = whiteScore, black = blackScore) {
    return {
      WHITE: white,
      BLACK: black,
    };
  }

  function awardScore(color, amount, options = {}) {
    const { onWin, onAfterScore } = options;

    const current = color === "WHITE" ? whiteScore : blackScore;
    const next = current + amount;

    const nextWhiteScore = color === "WHITE" ? next : whiteScore;
    const nextBlackScore = color === "BLACK" ? next : blackScore;

    if (color === "WHITE") {
      setWhiteScore(next);
    } else {
      setBlackScore(next);
    }

    if (onAfterScore) {
      onAfterScore({
        color,
        amount,
        whiteScore: nextWhiteScore,
        blackScore: nextBlackScore,
      });
    }

    // Use the dynamic point goal (Sprint 15 / Standard 25 / Marathon 50).
    if (next >= winGoal) {
      setWinner(color);

      if (onWin) {
        onWin({
          winner: color,
          whiteScore: nextWhiteScore,
          blackScore: nextBlackScore,
        });
      }

      return true;
    }

    return false;
  }

  function resetScoreSystem() {
    setWhiteScore(0);
    setBlackScore(0);
    setWinner(null);
  }

  function setPointGoal(goal) {
    if (typeof goal === "number" && goal > 0) {
      setWinGoal(goal);
    }
  }

  return {
    whiteScore,
    setWhiteScore,
    blackScore,
    setBlackScore,

    winner,
    setWinner,

    // Dynamic win threshold (Sprint 15 / Standard 25 / Marathon 50).
    winGoal,
    setWinGoal: setPointGoal,

    getScore,
    getScoreSnapshot,
    awardScore,
    resetScoreSystem,
  };
}

export default useScoreSystem;
