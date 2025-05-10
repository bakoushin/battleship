import React from 'react'
import classes from './index.module.css'
import { SHIP, HIT, MISS, EMPTY } from '../../constants/game'

type BoardProps = {
  board: string[]
  onClick?: (index: number) => void
  pendingCellIndex?: number
  disabled?: boolean
}

const Board: React.FC<BoardProps> = ({ board, onClick, pendingCellIndex, disabled }) => {
  return (
    <div className={classes.board}>
      {board.map((cell, index) => (
        <div
          key={index}
          className={[
            classes.cell,
            classes.wall,
            index === pendingCellIndex
              ? classes.pending
              : cell === SHIP
              ? classes.ship
              : cell === HIT
              ? classes.hit
              : cell === MISS
              ? classes.miss
              : classes.empty,
            cell === EMPTY && onClick && !pendingCellIndex && !disabled ? classes.clickable : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => cell === EMPTY && !pendingCellIndex && !disabled && onClick && onClick(index)}
        ></div>
      ))}
    </div>
  )
}

export default Board
