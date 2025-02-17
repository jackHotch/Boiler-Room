'use client'

import styles from './Friends.module.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function Friends() {
  const [friendsInfo, setFriendsInfo] = useState([])
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
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
        {loading
          ? 'Fetching Friends Data...'
          : friendsInfo?.map((friend, key) => {
              return (
                <div className={styles.friend_info} key={key}>
                  <h4 className={styles.username}>{friend.username}</h4>

                  <div className={styles.recent_game_list}>
                    {friend.recentGames?.map((game, key) => {
                      return (
                        <Link className={styles.recent_game} key={key} href='/SingleGame'>
                          <span>{game.name}</span>
                          <span>
                            {Math.round(game.playtime_forever / 60)} hours played
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
