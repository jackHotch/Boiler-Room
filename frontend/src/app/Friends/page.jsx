'use client'

import styles from './Friends.module.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

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
          window.location.href = '/LoginRedirect';
      }
    } catch (error) {
      window.location.href = '/LoginRedirect';
    }
  }

  const [friendsInfo, setFriendsInfo] = useState([])
  const [loading, setLoading] = useState(false)

  function formatData(data) {
    return data.reduce((acc, { username, game_id, last_2_weeks }) => {
      let user = acc.find((user) => user.username === username)
      if (!user) {
        user = { username: username, games: [] }
        acc.push(user)
      }

      user.games.push({
        gameId: parseInt(game_id, 10),
        playtime: parseInt(last_2_weeks, 10),
      })

      return acc
    }, [])
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
      console.log(formattedData)
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
                <h4 className={styles.username}>{friend.username}</h4>

                {friend.games[0].gameId != -1 && (
                  <span className={styles.recently_played_label}>
                    Recently Played Games
                  </span>
                )}
                <div className={styles.recent_game_list}>
                  {friend.games?.map((game, key) => {
                    return game.gameId == -1 ? (
                      <span className={styles.no_recent_games_message}>
                        Your friend hasn't played any games recently
                      </span>
                    ) : (
                      <div className={styles.recent_game} key={key}>
                        <Link href={`SingleGame/${game.gameId}`}>
                          <img
                            className={styles.image}
                            src={
                              'https://steamcdn-a.akamaihd.net/steam/apps/' +
                              game.gameId +
                              '/library_600x900_2x.jpg'
                            }
                            alt='Title'
                          />
                        </Link>
                        <span>
                          {Math.round(game.playtime / 60)} hours in last 2 weeks
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
