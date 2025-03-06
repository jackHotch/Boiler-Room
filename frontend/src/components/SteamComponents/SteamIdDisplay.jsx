'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from '@/components/SteamComponents/Login'
import Logout from '@/components/SteamComponents/Logout'
import styles from './SteamIdDisplay.module.css'

export default function SteamIdDisplay() {
  const [steamId, setSteamId] = useState(null)
  const [steamName, setSteamName] = useState(null)
  const [steamPFP, setSteamPFP] = useState(null)
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
          setSteamPFP(response.data.steamPFP)

          // Store the data in local storage to avoid too many requests
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

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        {loading ? (
          <p className={styles.loadingText}>Loading Steam data...</p>
        ) : error ? (
          <>
            <p className={styles.errorText}>{error}</p>
            <Login />
          </>
        ) : (
          <>
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
                <Logout />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
