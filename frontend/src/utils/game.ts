import { EMPTY, SHIP } from '../constants/game'

const SIZE = 6

export function generateGameId(): bigint {
  const randomBytes = new Uint8Array(16)
  window.crypto.getRandomValues(randomBytes)
  return randomBytes.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n)
}

export function generateEmptyBoard(): string[] {
  return Array(SIZE * SIZE).fill(EMPTY)
}

export function generateBoard(): string[] {
  const board = Array(SIZE * SIZE).fill(EMPTY)
  const ships = [
    { len: 3, count: 1 },
    { len: 2, count: 2 },
    { len: 1, count: 3 },
  ]

  function canPlace(pos: number, len: number, horiz: boolean) {
    for (let i = 0; i < len; i++) {
      const r = Math.floor((pos + (horiz ? i : i * SIZE)) / SIZE)
      const c = (pos + (horiz ? i : i * SIZE)) % SIZE
      if (r >= SIZE || c >= SIZE || board[pos + (horiz ? i : i * SIZE)] !== EMPTY) return false
    }
    return true
  }

  function isAdjacent(pos: number, len: number, horiz: boolean) {
    const dirs = [-1, 0, 1]
    for (let i = 0; i < len; i++) {
      const idx = pos + (horiz ? i : i * SIZE)
      const row = Math.floor(idx / SIZE)
      const col = idx % SIZE
      for (let dr of dirs) {
        for (let dc of dirs) {
          if (dr === 0 && dc === 0) continue
          const nr = row + dr
          const nc = col + dc
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) continue
          const nidx = nr * SIZE + nc
          if (board[nidx] === SHIP) return true
        }
      }
    }
    return false
  }

  function placeShip(len: number) {
    let candidates: { pos: number; horiz: boolean }[] = []
    for (let horiz of [true, false]) {
      const maxStart = horiz ? SIZE * SIZE - len : SIZE * (SIZE - len + 1) - 1
      for (let pos = 0; pos <= maxStart; pos++) {
        if (horiz && pos % SIZE > SIZE - len) continue
        if (canPlace(pos, len, horiz) && !isAdjacent(pos, len, horiz)) {
          candidates.push({ pos, horiz })
        }
      }
    }
    let placed = false
    if (candidates.length > 0) {
      const { pos, horiz } = candidates[Math.floor(Math.random() * candidates.length)]
      for (let i = 0; i < len; i++) {
        board[pos + (horiz ? i : i * SIZE)] = SHIP
      }
      placed = true
    }
    // fallback: allow adjacent if no options
    while (!placed) {
      const horiz = Math.random() < 0.5
      const maxStart = horiz ? SIZE * SIZE - len : SIZE * (SIZE - len + 1) - 1
      const pos = Math.floor(Math.random() * (maxStart + 1))
      if (horiz && pos % SIZE > SIZE - len) continue
      if (canPlace(pos, len, horiz)) {
        for (let i = 0; i < len; i++) {
          board[pos + (horiz ? i : i * SIZE)] = SHIP
        }
        placed = true
      }
    }
  }

  ships.forEach(s => {
    for (let i = 0; i < s.count; i++) placeShip(s.len)
  })

  return board
}

export function boardToBinaryNumber(board: string[], symbol: string): bigint {
  let result = 0n
  for (const cell of board) {
    result = (result << 1n) | (cell === symbol ? 1n : 0n)
  }
  return result
}

export function binaryNumberToBoard(num: bigint, symbol: string): string[] {
  const bin = num.toString(2).padStart(36, '0')
  return Array.from(bin, c => (c === '1' ? symbol : EMPTY))
}

export function printBoard(board: string[]) {
  for (let i = 0; i < board.length; i += SIZE) {
    console.log(board.slice(i, i + SIZE).join(' '))
  }
}
