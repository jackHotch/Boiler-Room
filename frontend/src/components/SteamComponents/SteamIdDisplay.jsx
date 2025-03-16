'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from '@/components/SteamComponents/Login'
import Logout from '@/components/SteamComponents/Logout'

export default function SteamIdDisplay() {
  const [steamId, setSteamId] = useState(null)
  const [steamName, setSteamName] = useState(null)
  const [steamPFP, setPFP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/steam/getdisplayinfo',
          {
            withCredentials: true,
          }
        )

        setSteamId(response.data.steamId)
        setSteamName(response.data.steamName)
        setPFP(response.data.steamPFP)

        if (response.data.steamId === null) setError('Not Logged In')
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
