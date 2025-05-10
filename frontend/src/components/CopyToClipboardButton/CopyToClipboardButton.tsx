import { FC, useState } from 'react'
import { Button } from '../Button'

interface CopyToClipboardButtonProps {
  value: string
  label?: string
  copiedLabel?: string
  timeout?: number
}

export const CopyToClipboardButton: FC<CopyToClipboardButtonProps> = ({
  value,
  label = 'Copy link',
  copiedLabel = 'Copied!',
  timeout = 1500,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Button onClick={handleCopy} disabled={copied}>
      {copied ? copiedLabel : label}
    </Button>
  )
}
