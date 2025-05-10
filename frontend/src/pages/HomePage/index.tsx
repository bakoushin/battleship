import { FC } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { CreateGame } from '../../components/CreateGame'
import classes from './index.module.css'
import { useAccount } from 'wagmi'
import { useWeb3Auth } from '../../hooks/useWeb3Auth'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export const HomePage: FC = () => {
  const { address } = useAccount()
  const {
    state: { authInfo },
    fetchAuthInfo,
  } = useWeb3Auth()

  return (
    <div>
      <Card header={<h2>⚓︎ Battleships</h2>}>
        {address && !!authInfo && <CreateGame />}
        {!address && (
          <div>
            <div className={classes.label}>
              <p>Please connect your wallet to get started.</p>
            </div>
            <div className={classes.actions}>
              <ConnectButton />
            </div>
          </div>
        )}
        {address && !authInfo && (
          <div>
            <p className={classes.label}>Please log in.</p>
            <div className={classes.actions}>
              <Button onClick={fetchAuthInfo}>Log in</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
