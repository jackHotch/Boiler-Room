'use client'

import styles from './Navbar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'

// Dynamically load SteamIdDisplay to avoid SSR issues
const SteamIdDisplay = dynamic(() => import('../SteamComponents/SteamIdDisplay'), {
  ssr: false,
})

export function Navbar() {
  const pathname = usePathname()
  const [showSteam, setShowSteam] = useState(false) // Track hover
  const [steamPFP, setPFP] = useState(null)
  const [loading, setLoading] = useState(true)

  if (pathname === '/') return null

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/steam/getdisplayinfo`,
          { withCredentials: true }
        )

        if (response.data.steamPFP) {
          localStorage.setItem('profileImage', response.data.steamPFP)
          localStorage.setItem('steamId', response.data.steamId)
          localStorage.setItem('steamName', response.data.steamName)

          setPFP(response.data.steamPFP) // Update state
        }
      } catch (error) {
        console.error('Error fetching Steam Info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

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
          New Game Recommendations
        </Link>
        <div className={styles.searchbar}>
          <input className={styles.input} type='text' placeholder='Search' />
          <img src='/search.png' className={styles.search_icon} width={16} />
        </div>

        {/* Steam Display Container for hovering */}
        <div
          className={styles.accountContainer}
          onMouseEnter={() => setShowSteam(true)}
          onMouseLeave={() => setShowSteam(false)}>

          <Link className={`${styles.links} ${styles.account}`} href='/Account'>
            P
          </Link>
          {/* Show Steam component on hover */}
          {showSteam && <SteamIdDisplay />} 
        </div>
      </div>
    </div>
  )
}
