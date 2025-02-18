import { useState, useEffect } from 'react'
import axios from 'axios'

import Login from '../../components/SteamComponents/Login'
import Logout from '../../components/SteamComponents/Logout'

const SteamIdDisplay = () => {
  const [steamId, setSteamId] = useState(null) // For storing Steam ID
  const [steamName, setSteamName] = useState(null) // For storing Steam account name
  const [loading, setLoading] = useState(true) // For loading state
  const [error, setError] = useState(null) // For error state

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/steam/getdisplayinfo',
          {
            withCredentials: true, // Ensure credentials (cookies) are sent
          }
        )

        console.log('Response Data:', response.data) // Check what data is returned

        setSteamId(response.data.steamId)
        setSteamName(response.data.steamName)

        if (response.data.steamId == null) setError('Not Logged In')
      } catch (error) {
        console.error('Error fetching Steam ID:', error)
        setError('Not Logged In')
      } finally {
        setLoading(false) // End loading state
      }
    }

    fetchProfileData()
  }, []) // Empty array ensures this runs only once on mount

  return (
    <div style={styles.container}>
      <div style={styles.infoContainer}>
        {loading ? (
          <p style={styles.loadingText}>Loading Steam data...</p> // Show loading message
        ) : error ? (
          <>
            <p style={styles.errorText}>{error}</p> {/* Show error message */}
            <Login /> {/* Show login button */}
          </>
        ) : (
          <>
            <p style={styles.steamInfo}>
              <strong>Steam ID:</strong> {steamId}
            </p>
            <p style={styles.steamInfo}>
              <strong>Steam Account Name:</strong> {steamName}
            </p>
            <Logout /> {/* Show logout button */}
          </>
        )}
      </div>
    </div>
  )
}

// Styles for the component
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '15%', // Set the distance from the top
    right: '0%', // Set the distance from the right
    zIndex: 1000, // Ensure it stays on top of other elements
  },
  loadingText: {
    fontSize: '18px',
    color: '#666',
  },
  errorText: {
    fontSize: '18px',
    color: 'red',
    fontWeight: 'bold',
  },
  infoContainer: {
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    textAlign: 'center',
    width: '300px',
  },
  steamInfo: {
    fontSize: '16px',
    color: '#333',
    margin: '10px 0',
  },
}

export default SteamIdDisplay
