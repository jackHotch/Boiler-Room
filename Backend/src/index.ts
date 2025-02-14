import express from 'express'
import pg from 'pg'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'

const { Pool } = pg
dotenv.config()
const app = express()
const port = 8080
app.use(express.json())
app.use(cors())

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DB_URL,
})
pool.connect()

// Endpoints
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('hello')
})

app.get('/test', (req, res) => {
  res.json({ message: 'this is a test from the backend' })
})

app.get('/supabase', async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM test`)
  res.send(rows[0].message)
})


app.get('/people', async(req, res) => {
  const { rows } = await pool.query(`SELECT * FROM userstest`);
  const peopleData = rows.map(row => row.people).join('\n');
  res.send(peopleData);
})

app.get('/steam', async (req, res) => {
  const key = process.env.STEAM_API_KEY
  const steamId = 76561199509790498n
  const data = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true `)
  res.send([data.data.response.games[0], data.data.response.games[1], data.data.response.games[2]])
})

async function checkAccount(steamId) {
  let retVal = 0;
  const KEY = process.env.STEAM_API_KEY;

  try {
      // Checking game details
      const gameResponse = await axios.get('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
          params: {
              steamid: steamId,
              include_appinfo: true,
              key: KEY
          }
      });

      if (Object.keys(gameResponse.data.response).length > 0) {
          retVal += 2;
      }

      // Checking friends list access
      const friendsResponse = await axios.get('http://api.steampowered.com/ISteamUser/GetFriendList/v0001/', {
          params: {
              steamid: steamId,
              relationship: "friend",
              key: KEY
          }
      });

      if (Object.keys(friendsResponse.data).length > 0) {
          retVal += 1;
      }
  } catch (error) {
      console.error("Error fetching Steam API:", error.message);
  }
/*
retVal:
 = 3 - account is all public and good to go
 = 2 - game details public, not friends list
 = 1 - friends list public, not game details
 = 0 - nothing public
*/ 
  return retVal;
}

export default app