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

export default app