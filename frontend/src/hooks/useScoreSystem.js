import { useState } from 'react'

function useScoreSystem({ targetScore }) {
  const [whiteScore, setWhiteScore] = useState(0)
  const [blackScore, setBlackScore] = useState(0)
  const [winner, setWinner] = useState(null)

  function getScore(color) {
    return color === 'WHITE' ? whiteScore : blackScore
  }

  function getScoreSnapshot(
    white = whiteScore,
    black = blackScore
  ) {
    return {
      WHITE: white,
      BLACK: black,
    }
  }

  function awardScore(color, amount, options = {}) {
    const {
      onWin,
      onAfterScore,
    } = options

    const current = color === 'WHITE' ? whiteScore : blackScore
    const next = current + amount

    const nextWhiteScore = color === 'WHITE' ? next : whiteScore
    const nextBlackScore = color === 'BLACK' ? next : blackScore

    if (color === 'WHITE') {
      setWhiteScore(next)
    } else {
      setBlackScore(next)
    }

    if (onAfterScore) {
      onAfterScore({
        color,
        amount,
        whiteScore: nextWhiteScore,
        blackScore: nextBlackScore,
      })
    }

    if (next >= targetScore) {
      setWinner(color)

      if (onWin) {
        onWin({
          winner: color,
          whiteScore: nextWhiteScore,
          blackScore: nextBlackScore,
        })
      }

      return true
    }

    return false
  }

  function resetScoreSystem() {
    setWhiteScore(0)
    setBlackScore(0)
    setWinner(null)
  }

  return {
    whiteScore,
    setWhiteScore,
    blackScore,
    setBlackScore,

    winner,
    setWinner,

    getScore,
    getScoreSnapshot,
    awardScore,
    resetScoreSystem,
  }
}

export default useScoreSystem