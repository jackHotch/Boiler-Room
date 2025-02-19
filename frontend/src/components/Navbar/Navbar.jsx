'use client'

import styles from './Navbar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import SteamIdDisplay from '../SteamComponents/SteamIdDisplay' // Import Steam Component

export function Navbar() {
  const pathname = usePathname()
  const [showSteam, setShowSteam] = useState(false) // State to track hover

  if (pathname == '/') return null

  return (
    <div className={styles.container}>
      <Link className={styles.logo} href='/Dashboard'>
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
        
        {/* Steam Display Container for hovering*/}
        <div 
          className={styles.accountContainer} 
          onMouseEnter={() => setShowSteam(true)} 
          onMouseLeave={() => setShowSteam(false)}
        >
          <Link className={`${styles.links} ${styles.account}`} href='/Accounts'>
            P
          </Link>
          {/* Show Steam component on hover */}
          {showSteam && <SteamIdDisplay />} 
        </div>
      </div>
    </div>
  )
}
