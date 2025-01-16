'use client'

import { useState } from 'react'
import axios from 'axios'

export default function Steam() {
  const [steamData, setsteamData] = useState([])

  async function handleClick() {
    // fetch data from the backend
    const data = await axios.get(process.env.NEXT_PUBLIC_BACKEND + '/steam')
    setsteamData(data.data)
  }

  return (
    <>
      <h1>This is the home page</h1>
      <button onClick={handleClick}>click to fetch data from steam</button>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>

        {steamData.map((game, key) => {
          return (
            <tbody key={key}>
              <tr>
                <td>AppID</td>
                <td>{game.appid}</td>
              </tr>
              <tr>
                <td>Name</td>
                <td>{game.name}</td>
              </tr>
              <tr>
                <td>Playtime (In Minutes)</td>
                <td>{game.playtime_forever}</td>
              </tr>
              <tr>
                <td>Playtime (Windows Only)</td>
                <td>{game.playtime_windows_forever}</td>
              </tr>
              <tr>
                <td>Playtime (Mac Only)</td>
                <td>{game.playtime_mac_forever}</td>
              </tr>
              <tr>
                <td>Time Last Played (Unix)</td>
                <td>{game.rtime_last_played}</td>
              </tr>
              <tr></tr>
            </tbody>
          )
        })}
      </table>
    </>
  )
}
