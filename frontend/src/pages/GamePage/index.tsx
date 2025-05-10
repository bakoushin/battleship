import { FC, useEffect, useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import classes from './index.module.css'
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { WAGMI_CONTRACT_CONFIG, WagmiUseReadContractReturnType } from '../../constants/config'
import { useWeb3Auth } from '../../hooks/useWeb3Auth'
import { binaryNumberToBoard, generateEmptyBoard } from '../../utils/game'
import Board from '../../components/Board'
import { Address, zeroAddress } from 'viem'
import { CopyToClipboardButton } from '../../components/CopyToClipboardButton/CopyToClipboardButton'
import { JoinGame } from '../../components/JoinGame'
import { useParams } from 'react-router-dom'
import { EMPTY, HIT, MISS, SHIP } from '../../constants/game'
import { PlayAgain } from '../../components/ PlayAgain'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import BoardSkeleton from '../../components/BoardSkeleton'

const ONE_SECOND = 1000

export const GamePage: FC = () => {
  return (
    <div className={classes.homePage}>
      <Card header={<h2>⚓︎ Battleship</h2>}>
        <Game />
      </Card>
    </div>
  )
}

const Game: FC = () => {
  const { address } = useAccount()
  const {
    state: { authInfo },
    fetchAuthInfo,
  } = useWeb3Auth()

  const { id } = useParams()
  const gameId = id ? BigInt(`0x${id}`) : 0n

  const { data: gameStatus, refetch: refetchGameStatus } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'getGameStatus',
    args: [gameId],
  }) satisfies WagmiUseReadContractReturnType<'getGameStatus', [Address, Address, Address, boolean]>

  useEffect(() => {
    const intervalId = setInterval(() => refetchGameStatus(), ONE_SECOND)
    return () => clearInterval(intervalId)
  }, [gameId, refetchGameStatus])

  const [player1, player2, currentPlayer, gameOver] = gameStatus ?? [
    zeroAddress,
    zeroAddress,
    zeroAddress,
    false,
  ]

  const gameNotFound = player1 === zeroAddress && player2 === zeroAddress
  const gameExists = !gameNotFound
  const waitingForOpponent = player1 === address && player2 === zeroAddress
  const gameReady = player1 !== zeroAddress && player2 !== zeroAddress
  const myGame = player1 === address || player2 === address
  const wrongGame = gameReady && !myGame
  const canPlay = myGame && gameReady && !gameOver && currentPlayer === address
  const shouldWait = myGame && gameReady && !gameOver && currentPlayer !== address
  const canJoin = gameExists && !myGame && !gameReady && !gameOver
  const isWinner = gameOver && currentPlayer !== address

  const { data: ships, refetch: refetchShips } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'getShips',
    args: [gameId, authInfo],
    query: {
      enabled: !!authInfo,
    },
  }) satisfies WagmiUseReadContractReturnType<'message', bigint>

  useEffect(() => {
    const intervalId = setInterval(() => refetchShips(), ONE_SECOND)
    return () => clearInterval(intervalId)
  }, [gameId, refetchShips])

  const { data: hits, refetch: refetchHits } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'getHits',
    args: [gameId, address],
    query: {
      enabled: !!authInfo,
    },
  }) satisfies WagmiUseReadContractReturnType<'message', bigint>

  useEffect(() => {
    const intervalId = setInterval(() => refetchHits(), ONE_SECOND)
    return () => clearInterval(intervalId)
  }, [gameId, refetchHits])

  const playerShipsBoard = ships !== undefined ? binaryNumberToBoard(ships, SHIP) : null
  const playerHitsBoard = hits !== undefined ? binaryNumberToBoard(hits, HIT) : null

  const playerBoard =
    playerShipsBoard && playerHitsBoard
      ? playerShipsBoard.map((cell, index) => (playerHitsBoard[index] === HIT ? HIT : cell))
      : null

  const { data: opponentHits, refetch: refetchOpponentHits } = useReadContract({
    ...WAGMI_CONTRACT_CONFIG,
    functionName: 'getHits',
    args: [gameId, player1 === address ? player2 : player1],
  }) satisfies WagmiUseReadContractReturnType<'message', bigint>

  useEffect(() => {
    const intervalId = setInterval(() => refetchOpponentHits(), ONE_SECOND)
    return () => clearInterval(intervalId)
  }, [gameId, refetchOpponentHits])

  const opponentHitsBoard = opponentHits !== undefined ? binaryNumberToBoard(opponentHits, HIT) : null

  const [opponentMissesBoard, setOpponentMissesBoard] = useState<string[]>(generateEmptyBoard())

  const opponentBoard =
    opponentHitsBoard && opponentMissesBoard
      ? opponentMissesBoard.map((cell, index) => (opponentHitsBoard[index] === HIT ? HIT : cell))
      : null

  const {
    data: setMessageTxHash,
    writeContract,
    isPending: isWriteContractPending,
    isError: isWriteContractError,
    error: writeContractError,
    reset: resetWriteContract,
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

  const [pendingIndex, setPendingIndex] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (isTransactionReceiptSuccess || writeContractError || transactionReceiptError) {
      resetWriteContract()
      if (!isTransactionReceiptSuccess && pendingIndex !== undefined) {
        setOpponentMissesBoard(prev => {
          const newBoard = [...prev]
          newBoard[pendingIndex] = EMPTY
          return newBoard
        })
      }
      setPendingIndex(undefined)
    }
  }, [isInteractingWithChain])

  const handleAttack = (index: number) => {
    setPendingIndex(index)
    setOpponentMissesBoard(prev => {
      const newBoard = [...prev]
      newBoard[index] = MISS
      return newBoard
    })
    attack(index)
  }

  async function attack(index: number) {
    writeContract({
      ...WAGMI_CONTRACT_CONFIG,
      functionName: 'attack',
      args: [gameId, BigInt(index)],
    })
  }

  if (gameNotFound) {
    return (
      <>
        <div className={classes.label}>
          <p>Game not found.</p>
        </div>
        <div className={classes.actions}>
          <PlayAgain title="Start new game" />
        </div>
      </>
    )
  }

  if (!address) {
    return (
      <div>
        <div className={classes.label}>
          <p>Please connect your wallet to get started.</p>
        </div>
        <div className={classes.actions}>
          <ConnectButton />
        </div>
      </div>
    )
  }

  if (!authInfo) {
    return (
      <div>
        <p className={classes.label}>Please log in.</p>
        <div className={classes.actions}>
          <Button onClick={fetchAuthInfo}>Log in</Button>
        </div>
      </div>
    )
  }

  if (wrongGame) {
    return (
      <>
        <div className={classes.label}>
          <p>Wrong game.</p>
        </div>
        <div className={classes.actions}>
          <PlayAgain title="Start new game" />
        </div>
      </>
    )
  }

  return (
    <>
      {gameReady && !playerBoard && <BoardSkeleton />}
      {gameReady && playerBoard && (
        <>
          <h1 className={classes.header}>You</h1>
          <Board board={playerBoard} />
        </>
      )}
      {canJoin && <JoinGame gameId={gameId} />}
      {gameReady && (
        <>
          <h1 className={classes.header}>Opponent</h1>
          {!opponentBoard && <BoardSkeleton />}
          {opponentBoard && (
            <Board
              board={opponentBoard}
              onClick={handleAttack}
              pendingCellIndex={pendingIndex}
              disabled={!canPlay}
            />
          )}
        </>
      )}
      {!!pendingIndex && (
        <div className={classes.label}>
          <h1>Processing transaction...</h1>
        </div>
      )}
      {!pendingIndex && canPlay && (
        <div className={classes.label}>
          <h1>Your turn!</h1>
        </div>
      )}
      {!pendingIndex && shouldWait && (
        <div className={classes.label}>
          <h1>Wait for their move...</h1>
        </div>
      )}
      {gameOver && isWinner && (
        <div>
          <div className={classes.label}>
            <h1 className={classes.pulsate}>🎉 You won! 🎉</h1>
          </div>
          <div className={classes.actions}>
            <PlayAgain />
          </div>
        </div>
      )}
      {gameOver && !isWinner && (
        <>
          <div className={classes.label}>
            <h1 className={classes.pulsate}>🏁 Game over! 🏁</h1>
          </div>
          <div className={classes.actions}>
            <PlayAgain />
          </div>
        </>
      )}
      {waitingForOpponent && (
        <div>
          <div className={classes.label}>
            <p>Waiting for opponent...</p>
          </div>
          <div className={classes.label}>
            <p>Invite via link:</p>
            <a href={window.location.href}>{window.location.href}</a>
          </div>
          <div className={classes.label}>
            <CopyToClipboardButton value={window.location.href} label="Copy link" copiedLabel="Copied!" />
          </div>
        </div>
      )}
    </>
  )
}
