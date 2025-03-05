'use client'

import { useState } from 'react';
import axios from 'axios';

export default function Test() {
  const [databaseMessage, setDatabaseMessage] = useState('');

  async function handleProfile() {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/insertProfile');
      setDatabaseMessage(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
      setDatabaseMessage('Failed to insert message');
    }
  }

  async function handleGames() {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/insertGames');
      setDatabaseMessage(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
      setDatabaseMessage('Failed to insert message');
    }
  }

  return (
    <>
      <h1 style={{ color: "white" }}>This is my test page - Chris</h1>
      <button onClick={handleProfile}>click to test writing to profile table</button>
      {databaseMessage && <p style={{ color: "white" }}>Message from database: {databaseMessage}</p>}
      <br></br>
      <button onClick={handleGames}>click to test writing to userbase table</button>
      {databaseMessage && <p style={{ color: "white" }}>Message from database: {databaseMessage}</p>}
    </>
  );
}