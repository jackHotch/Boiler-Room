'use client'
import styles from './Navbar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { Searchbar } from './Searchbar/Searchbar'

const SteamIdDisplay = dynamic(() => import('../SteamComponents/SteamIdDisplay'), {
  ssr: false,
})

export function Navbar() {
  const pathname = usePathname()
  const [steamPFP, setPFP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSteamId, setShowSteamId] = useState(false)
  const [hovering, setHovering] = useState(false)

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

          setPFP(response.data.steamPFP)
        }
      } catch (error) {
        console.error('Error fetching Steam Info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  useEffect(() => {
    let timeout
    if (!hovering) {
      timeout = setTimeout(() => setShowSteamId(false), 250)
    } else {
      setShowSteamId(true)
    }
    return () => clearTimeout(timeout)
  }, [hovering])

  if (pathname === '/' || pathname === '/LoginRedirect') return null

  return (
    <div className={styles.container}>
      <Link className={styles.logoBackground} href='/Dashboard'>
        <img
          className={styles.logoDark}
          src='/BRLogo.png'
          width={250}
        />
      </Link>

      <div className={styles.nav_options}>
        <Link className={styles.links} href='/Friends'>Friends</Link>
        <Link className={styles.links} href='/NewGameRecs'>Recommendations</Link>

        <Searchbar />
        <ThemeToggle />

        {/* Steam Profile Image & Toggle */}
        <div
          className={styles.accountContainer}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <img
            className={styles.pfp}
            src={steamPFP || 'https://placehold.co/40x40/black/white?text=P'}
            alt='Profile'
          />

          {showSteamId && (
            <div
              className={styles.steamComponent}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <SteamIdDisplay />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
