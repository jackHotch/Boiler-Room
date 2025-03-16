import styles from './ThemeToggle.module.css'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function toggleTheme() {
    if (theme == 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return (
    <button onClick={toggleTheme} className={styles.button}>
      {theme == 'dark' ? (
        <img src='dark-mode.png' width={20} />
      ) : (
        <img src='light-mode.png' width={20} />
      )}
    </button>
  )
}
