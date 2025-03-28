'use client'

import styles from './Navbar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { Searchbar } from './Searchbar/Searchbar'

// Dynamically load SteamIdDisplay to avoid SSR issues
const SteamIdDisplay = dynamic(() => import('../SteamComponents/SteamIdDisplay'), {
  ssr: false,
})

export function Navbar() {
  const pathname = usePathname()
  const [showSteam, setShowSteam] = useState(false) // Track hover
  const [steamPFP, setPFP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(true)

  if (pathname === '/' || pathname === '/LoginRedirect') return null

  useEffect(() => {
    async function fetchProfileData() {
       try {
        const theme = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/themepreference',
          {
            withCredentials: true,
          }
        )
      } catch (err) {
        console.error(err)
      }
      setTheme(theme)
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
      <Link className={theme === 1 ? styles.logo : styles.logoDark} href='/Dashboard'>
        <img src='BRLogo.png' width={250} />
      </Link>

      <div className={styles.nav_options}>
        <Link className={styles.links} href='/Friends'>
          Friends
        </Link>
        <Link className={styles.links} href='/NewGameRecs'>
          New Game Recommendations
        </Link>

        <Searchbar />

        <ThemeToggle />

        {/* Steam Display Container for hovering */}
        <div
          className={styles.accountContainer}
          onMouseEnter={() => setShowSteam(true)}
          onMouseLeave={() => setShowSteam(false)}
        >
          <Link href='/Account'>
            {!loading && steamPFP ? (
              <img className={styles.pfp} src={steamPFP} alt='Profile' />
            ) : (
              <img
                className={styles.pfp}
                src='https://placehold.co/40x40/black/white?text=P'
                alt='Profile'
              />
            )}
          </Link>
          {showSteam && <SteamIdDisplay />}
        </div>
      </div>
    </div>
  )
}
