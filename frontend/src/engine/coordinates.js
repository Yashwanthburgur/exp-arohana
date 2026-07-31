export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
export const launchFiles = ['d', 'e', 'f']

export function squareToPosition(square) {
  const file = square[0]
  const rank = Number(square.slice(1))

  return {
    x: files.indexOf(file),
    y: rank,
  }
}

export function positionToSquare(x, y) {
  if (!isPlayableSquare(x, y)) {
    return null
  }

  return `${files[x]}${y}`
}

export function isMainBoardSquare(x, y) {
  return x >= 0 && x <= 8 && y >= 1 && y <= 9
}

export function isLaunchSquare(x, y) {
  const file = files[x]

  return launchFiles.includes(file) && (y === 0 || y === 10)
}

export function isPlayableSquare(x, y) {
  return isMainBoardSquare(x, y) || isLaunchSquare(x, y)
}
