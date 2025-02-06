import pg from 'pg'
import cors from 'cors'
import { None } from 'openid-client';
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const { Pool } = pg
const port = 8080
const app = express();

// ✅ Ensure this is placed BEFORE any routes
app.use(session({
  secret: 'your_secret_key', // Change to a strong, random value
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true only if using HTTPS
}));

app.use(express.json()); // Support for JSON bodies
app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies
app.use(express.json())

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true // Allows sending cookies/sessions
}));

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


app.get('/steam', (req, res) => {
    console.log("Received query params:", req.query);
    const queryParams = req.query;
    const steamId = queryParams['openid.claimed_id'];

    if (steamId) 
      console.log("Steam Authentication Confirmed")
    else 
      res.status(400).send('Steam ID not found');
   
  let id = steamId.toString()
  id = id.slice(id.lastIndexOf('/id/') + 4); // Adding 4 to skip "/id/"
  req.session.steamId = id;
  console.log(req.session.steamId + " : " + id)
  res.redirect("http://localhost:3000/Steam")
});


app.get('/fetchRecent', async (req, res) => {
    console.log(req.session.steamId )
  console.log("Session Data:", req.session); // Log session info

  if (!req.session.steamId) {
    return res.status(400).send('Steam ID not found in session');
  }

  const steamId = req.session.steamId;
  const key = process.env.STEAM_API_KEY;

  try {
    const { data } = await axios.get(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/`, {
      params: {
        key: key,
        steamid: steamId,
        format: 'json'
      }
    });

    const games = data.response.games?.slice(0, 3) || [];
    res.send(games);
  } catch (error) {
    console.error("Error fetching Steam data:", error);
    res.status(500).send('Error fetching Steam data');
  }
});


app.get('/steam/logout', (req, res) => {
  console.log(req.session.steamId )
  console.log("Session Data:", req.session); // Log session info

  if (req.session.steamId) {
     req.session.steamId = None
  }
  res.redirect('/getSteamId')
});

app.get('/getSteamId', async (req, res) => {
  if (req.session.steamId) {
    try {
      const steamId = req.session.steamId;
      const key = process.env.STEAM_API_KEY; // Ensure your API key is set in .env

      // Fetch the player's summary data using Steam API
      const { data } = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/`, {
        params: {
          key: key,
          steamids: steamId,
        }
      });

      const player = data.response.players[0];
      if (player) {
        const steamName = player.personaname;  // Get the Steam account name
        res.json({ steamId, steamName });
      } else {
        res.status(400).send('Player not found');
      }
    } catch (error) {
      console.error('Error fetching Steam player summary:', error);
      res.status(500).send('Error fetching player summary');
    }
  } else {
    res.redirect("http://localhost:3000/Steam")
  }
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