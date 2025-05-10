import classes from './index.module.css'

const BOARD_SIZE = 6

export default function BoardSkeleton() {
  return (
    <div className="board board-skeleton">
      {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => (
        <div className="cell skeleton-cell" key={idx} />
      ))}
    </div>
  )
}
