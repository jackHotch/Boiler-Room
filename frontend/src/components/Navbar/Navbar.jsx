'use client'

import styles from './Navbar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()

  if (pathname == '/') return null

  return (
    <div className={styles.container}>
      <Link className={styles.logo} href='/'>
        Boiler Room
      </Link>
      <div className={styles.nav_options}>
        <Link className={styles.links} href='/Friends'>
          Friends
        </Link>
        <Link className={styles.links} href='/NewGameRecs'>
          New Game Recomendations
        </Link>
        <div className={styles.searchbar}>
          <input className={styles.input} type='text' placeholder='Search' />
          <img src='/search.png' className={styles.search_icon} width={16} />
        </div>
        <Link className={`${styles.links} ${styles.account}`} href='/Accounts'>
          P
        </Link>
      </div>
    </div>
  )
}
