import { useState, useEffect } from 'react';
import axios from 'axios';

const SteamIdDisplay =() => {
  const [steamId, setSteamId] = useState(null); // For storing Steam ID
  const [steamName, setSteamName] = useState(null); // For storing Steam account name
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state

  useEffect(() => {
    async function fetchSteamData() {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/getSteamId`, {
          withCredentials: true, // Ensure cookies are sent
        });

        // Set the Steam ID and name in state
        setSteamId(response.data.steamId || "None");
        setSteamName(response.data.steamName || "None");
      } catch (error) {
        console.error('Error fetching Steam ID:', error);
        setError('Not Logged In');
      } finally {
        setLoading(false); // End loading state
      }
    }

    fetchSteamData();
  }, []); // Empty array ensures it runs only once after component mounts

  return (
    <div style={styles.container}>
      {loading ? (
        <p style={styles.loadingText}>Loading Steam data...</p>  // Show loading message
      ) : error ? (
        <p style={styles.errorText}>{error}</p>  // Show error message
      ) : (
        <div style={styles.infoContainer}>
          <p style={styles.steamInfo}><strong>Steam ID:</strong> {steamId}</p>
          <p style={styles.steamInfo}><strong>Steam Account Name:</strong> {steamName}</p>
        </div>
      )}
    </div>
  );
};

// Styles for the component
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: '10px', // Set the distance from the top
    right: '60%', // Set the distance from the right
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
};
export default SteamIdDisplay;
