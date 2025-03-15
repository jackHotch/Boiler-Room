'use client'
import { useState, useEffect, Suspense } from 'react'
import axios from 'axios'
import styles from './SteamIdDisplay.module.css'

const handleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND}/auth/steam` // This will trigger the backend to redirect to Steam
}
const handleLogout = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND}/steam/logout` // This will trigger the backend to redirect to Steam
}

function SteamProfile() {
  const [steamId, setSteamId] = useState(null)
  const [steamName, setSteamName] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/steam/getdisplayinfo`,
          { withCredentials: true }
        )

        if (response.data.steamId) {
          setSteamId(response.data.steamId)
          setSteamName(response.data.steamName)

          localStorage.setItem('steamId', response.data.steamId)
          localStorage.setItem('steamName', response.data.steamName)
          localStorage.setItem('steamPFP', response.data.steamPFP)
        } else {
          setError('Not Logged In')
        }
      } catch (error) {
        console.error('Error fetching Steam ID:', error)
        setError('Not Logged In')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  if (loading) return <p className={styles.loadingText}>Loading Steam data...</p>
  if (error)
    return (
      <p className={styles.errorText}>
        {error}{' '}
        <button className='steamLogin' onClick={handleLogin} style={{}}>
          Log in with Steam
        </button>
      </p>
    )

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.textContainer}>
        <p className={styles.steamName}>
          <strong>{steamName}</strong>
        </p>
        <p className={styles.steamId}>
          <strong>Steam ID: {steamId}</strong>
        </p>
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.profileButton}>Profile</button>
        <button className={styles.steamLogout} onClick={handleLogout}>
          Logout
        </button>{' '}
      </div>
    </div>
  )
}

export default function SteamIdDisplay() {
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <Suspense fallback={<p className={styles.loadingText}>Loading Steam data...</p>}>
          <SteamProfile />
        </Suspense>
      </div>
    </div>
  )
}
