import { useEffect, useState } from 'react'

interface TypingTextProps {
  text: string
  isComplete?: boolean
  speed?: number
}

export default function TypingText({
  text,
  isComplete = true,
  speed = 30,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isAnimating, setIsAnimating] = useState(!isComplete)

  useEffect(() => {
    if (isComplete) {
      setDisplayedText(text)
      setIsAnimating(false)
      return
    }

    setIsAnimating(true)
    let currentIndex = 0

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsAnimating(false)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, isComplete, speed])

  return (
    <span className={isAnimating ? 'animate-typing' : 'typing-complete'}>
      {displayedText}
    </span>
  )
}
