import React from 'react'
import './Board.css'
import { SHIP, HIT, MISS, EMPTY } from '../../constants/game'

type BoardProps = {
  board: string[]
  onClick?: (index: number) => void
  pendingCellIndex?: number
  disabled?: boolean
}

const Board: React.FC<BoardProps> = ({ board, onClick, pendingCellIndex, disabled }) => {
  return (
    <div className="board">
      {board.map((cell, index) => (
        <div
          key={index}
          className={`cell ${
            index === pendingCellIndex
              ? 'pending'
              : cell === SHIP
              ? 'ship'
              : cell === HIT
              ? 'hit'
              : cell === MISS
              ? 'miss'
              : 'empty'
          } ${cell === EMPTY && onClick && !pendingCellIndex && !disabled ? 'clickable' : ''}`}
          onClick={() => cell === EMPTY && !pendingCellIndex && !disabled && onClick && onClick(index)}
        ></div>
      ))}
    </div>
  )
}

export default Board
