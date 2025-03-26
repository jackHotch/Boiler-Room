import { useEffect, useState } from 'react'
import styles from './CookieMessage.module.css'

export function CookieMessage() {
  const [showToast, setShowToast] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false)
    }, 10000)

    return () => {
      clearTimeout(timer)
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
