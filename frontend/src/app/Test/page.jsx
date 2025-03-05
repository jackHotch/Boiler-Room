'use client'

import { useState } from 'react';
import axios from 'axios';

export default function Test() {
  const [profileMessage, setProfileMessage] = useState('');
  const [gamesMessage, setGamesMessage] = useState('');
  const [isGamesLoading, setIsGamesLoading] = useState(false); // Loading state for handleGames

  async function handleProfile() {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/insertProfile');
      setProfileMessage(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
      setProfileMessage('Failed to insert message');
    }
  }

  async function handleGames() {
    setIsGamesLoading(true); // Set loading to true when the request starts
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/insertGames');
      setGamesMessage(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
      setGamesMessage('Failed to insert message');
    } finally {
      setIsGamesLoading(false); // Set loading to false when the request completes
    }
  }

  return (
    <>
      <h1 style={{ color: "white" }}>This is my test page - Chris</h1>
      <button onClick={handleProfile}>click to test writing to profile table</button>
      {profileMessage && <p style={{ color: "white" }}>Message from database: {profileMessage}</p>}
      <br></br>
      <button onClick={handleGames} disabled={isGamesLoading}>
        {isGamesLoading ? 'Loading...' : 'click to test writing to userbase table'}
      </button>
      {isGamesLoading ? (
        <p style={{ color: "white" }}>Loading...</p>
      ) : (
        gamesMessage && <p style={{ color: "white" }}>Message from database: {gamesMessage}</p>
      )}
    </>
  );
}