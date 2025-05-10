import { Button } from '../Button'
import { useNavigate } from 'react-router-dom'

export function PlayAgain({ title }: { title?: string }) {
  const navigate = useNavigate()

  function navigateToHome() {
    navigate('/')
  }

  return <Button onClick={navigateToHome}>{title ?? 'Play Again'}</Button>
}
