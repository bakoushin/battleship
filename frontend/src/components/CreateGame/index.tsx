import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { Button } from '../Button'
import { WAGMI_CONTRACT_CONFIG } from '../../constants/config'
import { parseEther } from 'viem'
import { boardToBinaryNumber, generateBoard, generateGameId } from '../../utils/game'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SHIP } from '../../constants/game'
import Board from '../Board'
import classes from './index.module.css'

export function CreateGame() {
  const navigate = useNavigate()

  const [gameId] = useState(generateGameId())

  const [board, setBoard] = useState<string[]>(generateBoard())

  function randomizeBoard() {
    setBoard(generateBoard())
  }

  const {
    data: setMessageTxHash,
    writeContract,
    isPending: isWriteContractPending,
    isError: isWriteContractError,
    error: writeContractError,
  } = useWriteContract()
  const {
    isPending: isTransactionReceiptPending,
    isSuccess: isTransactionReceiptSuccess,
    isError: isTransactionReceiptError,
    error: transactionReceiptError,
  } = useWaitForTransactionReceipt({
    hash: setMessageTxHash,
  })

  const isInteractingWithChain = isWriteContractPending || (setMessageTxHash && isTransactionReceiptPending)

  useEffect(() => {
    if (isTransactionReceiptSuccess) {
      navigate('/' + gameId.toString(16))
    }
  }, [isTransactionReceiptSuccess])

  async function createGame() {
    writeContract({
      ...WAGMI_CONTRACT_CONFIG,
      functionName: 'createGame',
      args: [gameId, boardToBinaryNumber(board, SHIP)],
      value: parseEther('5'),
    })
  }

  return (
    <div>
      <Board board={board} />
      <div className={classes.actions}>
        <Button variant="text" onClick={randomizeBoard}>
          Randomize
        </Button>

        <Button onClick={createGame} disabled={isInteractingWithChain}>
          {isInteractingWithChain ? 'Creating game...' : 'Create Game'}
        </Button>
        <p className={classes.secondaryText}>And bet 5 to win 10</p>
      </div>
    </div>
  )
}
