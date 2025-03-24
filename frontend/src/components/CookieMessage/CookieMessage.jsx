import { useEffect, useState } from 'react'
import styles from './CookieMessage.module.css'

export function CookieMessage() {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowToast(true)
    }, 3000)

    const hideTimer = setTimeout(() => {
      setShowToast(false)
    }, 8000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (showToast == false) {
    return null
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>!!Firefox Users!!</h3>
      <p className={styles.message}>
        Please enables cookies in order to continue to use our website
      </p>
    </div>
  )
}
