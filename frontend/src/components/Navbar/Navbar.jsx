import styles from './Navbar.module.css'
import Link from 'next/link'

export function Navbar() {
  return (
    <div className={styles.container}>
      <Link href='/'>Boiler Room</Link>
      <div className={styles.nav_options}>
        <Link href='/Friends'>Friends</Link>
        <Link href='/NewGameRecs'>New Game Recomendations</Link>
        <input type='text' placeholder='Search' />
        <Link href='/Accounts'>Account</Link>
      </div>
    </div>
  )
}
