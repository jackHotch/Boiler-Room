'use client'

import styles from './Friends.module.css'
import { useState, useEffect } from 'react'
import axios from 'axios'

export default function page() {
  const [friendsInfo, setFriendsInfo] = useState([])

  async function fetchFriendsList() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND + '/steam/friendsList',
        {
          withCredentials: true,
        }
      )

      return response.data
    } catch (error) {
      console.error('Error fetching Steam ID:', error)
    }
  }

  async function fetchFriendsInfo(friendsList) {
    const friendsInfoList = []
    for (const friend of friendsList) {
      try {
        const username = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/steam/username',
          {
            withCredentials: true,
            params: {
              steamid: friend.steamid,
            },
          }
        )

        const recentGames = await axios.get(
          process.env.NEXT_PUBLIC_BACKEND + '/steam/recentGames',
          {
            withCredentials: true,
            params: {
              steamid: friend.steamid,
            },
          }
        )

        friendsInfoList.push({
          username: username.data.username,
          recentGames: recentGames.data,
        })
      } catch (error) {
        console.error('Error Fetching Friends Info:', error)
      }
    }
    return friendsInfoList
  }

  useEffect(() => {
    async function fetchData() {
      const friendsList = await fetchFriendsList()
      const friendsInfoList = await fetchFriendsInfo(friendsList)
      setFriendsInfo(friendsInfoList)
    }

    fetchData()
  }, [])

  return (
    <div className={styles.container}>
      <h1>Your Friends</h1>
      <div className={styles.list_of_friends}>
        {friendsInfo?.map((friend, key) => {
          return (
            <div key={key}>
              <h4>{friend.username}</h4>
              {friend.recentGames?.map((game, key) => {
                return (
                  <div key={key}>
                    <p>{game.name}</p> <p>{game.playtime_forever}</p>
                  </div>
                )
              })}
              <br />
            </div>
          )
        })}
      </div>
    </div>
  )
}
