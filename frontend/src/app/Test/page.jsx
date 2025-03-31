'use client'

import { useState } from 'react';
import axios from 'axios';

export default function Test() {
  const [databaseMessage, setDatabaseMessage] = useState('');

  async function handleFriends() {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/testFriends');
      setDatabaseMessage(response.data.message);
    } catch (error) {
      console.error('Error fetching data', error);
      setDatabaseMessage('Failed to insert message');
    }
  }

  async function handleLockout() {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/testLockout');
      setDatabaseMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching lockout status:", error);
      setDatabaseMessage("Error fetching lockout status");
    }
  }

  return (
    <>
      <h1 style={{ color: "white" }}>This is my test page - Chris</h1>
      <button onClick={handleFriends}>click to test what its like to have friends</button>
      {/*<button onClick={handleLockout}>click to test global lockout</button>*/} 
      <p style={{ color: "white" }}>{databaseMessage}</p>
    </>
  );
}