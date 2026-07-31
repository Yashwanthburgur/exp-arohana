export function applyMove(pieces, selectedPiece, targetSquare) {
  const updatedPieces = pieces.filter(piece => {
    const isCapturedEnemy =
      piece.square === targetSquare &&
      piece.color !== selectedPiece.color

    return !isCapturedEnemy
  })

  return updatedPieces.map(piece => {
    if (piece.id !== selectedPiece.id) {
      return piece
    }

    return {
      ...piece,
      square: targetSquare,
    }
  })
}

export function switchTurn(currentTurn) {
  return currentTurn === 'WHITE' ? 'BLACK' : 'WHITE'
}