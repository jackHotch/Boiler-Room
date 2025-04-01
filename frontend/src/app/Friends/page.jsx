'use client'

import styles from './Friends.module.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FriendsRecentGames } from '@/components/GameDisplays/FriendsRecentGames/FriendsRecentGames'

export default function Friends() {
  //Function to check for login and redirect
  //to error page if not logged in
  if (!process.env.JEST_WORKER_ID) {
    checkLogin()
  }
  async function checkLogin() {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND}/steam/logininfo`,
        { withCredentials: true }
      )
      if (!response.data.steamId) {
        //redirect to error page if not logged in
        window.location.href = '/LoginRedirect'
      }
    } catch (error) {
      window.location.href = '/LoginRedirect'
    }
  }

  const [friendsInfo, setFriendsInfo] = useState([])
  const [loading, setLoading] = useState(false)

  function formatData(data) {
    return data.reduce(
      (acc, { username, game_id, last_2_weeks, title, friend_steam_id }) => {
        let user = acc.find((user) => user.username === username)
        if (!user) {
          user = { username: username, steamId: friend_steam_id, games: [] }
          acc.push(user)
        }

        user.games.push({
          gameId: parseInt(game_id),
          playtime: parseInt(last_2_weeks),
          title: title,
        })

        return acc
      },
      []
    )
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const response = await axios.get(
        process.env.NEXT_PUBLIC_BACKEND + '/friendsListInfo',
        {
          withCredentials: true,
        }
      )
      setLoading(false)
      const formattedData = formatData(response.data)
      setFriendsInfo(formattedData)
    }

    fetchData()
  }, [])

  return (
    <div className={styles.container}>
      <h1>Your Friends</h1>
      <div className={styles.list_of_friends}>
        {loading ? (
          <div className={styles.loading_message}>
            <span>Please wait while we fetch your friends data</span>
            <span>This could take a while if it's your first time visiting</span>
          </div>
        ) : (
          friendsInfo?.map((friend, key) => {
            return (
              <div className={styles.friend_info} key={key}>
                <a
                  className={styles.friend_steam_link}
                  target='_blank'
                  href={`https://steamcommunity.com/profiles/${friend.steamId}`}
                >
                  <h4 className={styles.username}>{friend.username}</h4>
                </a>

                <div className={styles.recent_game_list}>
                  <FriendsRecentGames games={friend.games} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
