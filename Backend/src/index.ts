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

app.get('/auth/steam', (req, res) => {
  const steamOpenIDUrl = 'https://steamcommunity.com/openid/login';
  
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',  // OpenID 2.0 namespace
    'openid.mode': 'checkid_setup',  // Start the authentication process
    'openid.return_to': 'http://localhost:8080/steam',  // Update this to match your backend port
    'openid.realm': 'http://localhost:8080/steam',  // Your realm URL
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',  // Steam OpenID identifier
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select'  // Steam OpenID identity
  });

  // Construct the full URL
  const authUrl = `${steamOpenIDUrl}?${params.toString()}`;
  
  // Redirect the user to Steam's OpenID login page
  res.redirect(authUrl);
});

app.get('/steam', async(req, res) => {
    console.log("Received query params:", req.query);
    const queryParams = req.query;
    const steamId = queryParams['openid.claimed_id'];

    if (steamId) 
      console.log("Steam Authentication Confirmed")
    else 
      res.status(400).send('Steam ID not found');
   
  let id = steamId.toString()
  id = id.slice(id.lastIndexOf('/id/') + 4); // Adding 4 to skip "/id/"
  const key = process.env.STEAM_API_KEY
  const data = await axios.get(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${key}&steamid=${id}&format=json`)
  res.send([data.data.response.games[0], data.data.response.games[1], data.data.response.games[2]])
});




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


export default app