import pg from 'pg'
import cors from 'cors'
const express = require('express')
const session = require('express-session')
import axios from 'axios'
import dotenv from 'dotenv'

const { Pool } = pg
const port = 8080
const app = express()

dotenv.config()

// Determine true/false from USE_HTTPS .env variable
var useHTTPS = process.env.USE_HTTPS?.toLowerCase?.() === 'true'

app.use(express.json()) // Support for JSON bodies
app.use(express.urlencoded({ extended: true })) // Support URL-encoded bodies

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DB_URL,
})
pool.connect()

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // unsure how important this key name is, look into
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: useHTTPS, // Use true for HTTPS in production
      httpOnly: !useHTTPS, // Prevent access to the cookie from JavaScript
      sameSite: 'lax', // Allow cookies in cross-origin requests
      maxAge: 1000 * 60 * 60 * 24, // Session expires in 24 hours
    },
  })
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allows sending cookies/sessions
  })
)

// Go through steams open id process and redirect to steam login, sends back request to our /steam handler route
app.get('/auth/steam', (req, res) => {
  const steamOpenIDUrl = 'https://steamcommunity.com/openid/login'

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0', // OpenID 2.0 namespace
    'openid.mode': 'checkid_setup', // Start the authentication process
    'openid.return_to': 'http://localhost:8080/steam', // Must be the url which recieves the open id info (rn it is /steam)
    'openid.realm': 'http://localhost:8080/steam',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select', // Steam OpenID identifier
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select', // Steam OpenID identity
  })

  // Construct the full URL
  const authUrl = `${steamOpenIDUrl}?${params.toString()}`

  // Redirect the user to Steam's OpenID login page
  res.redirect(authUrl)
})

// Receives steam open id data and extracts the steam id of the authed user
// Stores in express session for 24-hours
app.get('/steam', async (req, res) => {
  console.log('Received query params:', req.query)
  const queryParams = req.query
  const steamId = queryParams['openid.claimed_id']

  // Handle id not being found
  if (!steamId) return res.status(400).send('Steam ID not found')

  let id = steamId.toString()

  // Returns the steam ID in url format this trims it down
  id = id.slice(id.lastIndexOf('/id/') + 4) // Adding 4 to skip "/id/"

  // Fetch the steamName asynchronously and store it in the session
  try {
    const response = await axios.get(process.env.BACKEND_URL + '/steam/username', {
      params: { steamid: id }, // Send the steamid in the request
    })

    const steamName = response.data.username || 'Unknown' // Extract the username
    req.session.steamId = id
    req.session.steamName = steamName

    console.log('Steam ID Authenticated: ' + req.session.steamId)
    res.redirect(process.env.FRONTEND_URL)
  } catch (error) {
    console.error('Error fetching Steam username:', error)
    res.status(500).send('Error fetching Steam username')
  }
})

// Gets username from steam api using session steam ID
app.get('/steam/username', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId

  if (!steamId) {
    return res.status(400).send('Steam ID is required')
  }

  try {
    const response = await axios.get(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`,
      {
        params: {
          key: process.env.STEAM_API_KEY,
          steamids: steamId,
        },
      }
    )

    const username = response.data.response.players[0]?.personaname

    if (username) {
      res.status(200).json({ username })
    } else {
      res.status(404).send('Username not found')
    }
  } catch (error) {
    console.error('Error fetching Steam username:', error)
    res.status(500).send('Error fetching Steam username')
  }
})

// Get three most recent games from steam id
app.get('/steam/recentgames', async (req, res) => {
  if (!req.session.steamId) {
    res.status(400).send('Steam ID not found in session');
  }

  const steamId = req.query.steamid || req.session.steamId;
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
    res.redirect("http://localhost:3000");
  }
});

// "Logout" i.e. remove steam id and name from session storage
app.get('/steam/logout', (req, res) => {
  console.log(req.session.steamId)
  console.log('Session Data:', req.session)

  if (req.session.steamId) {
    req.session.steamId = null
    req.session.username = null
  }

  // Redirect the user back to the referring page
  res.redirect(process.env.FRONTEND_URL)
})

// Used for fetching display card info after login
app.get('/steam/getdisplayinfo', async (req, res) => {
  // If Steam ID and name are in the session, return them
  if (req.session.steamId && req.session.steamName) {
    console.log(req.session.steamId)
    return res.json({
      steamId: req.session.steamId,
      steamName: req.session.steamName,
    })
  } else {
    console.log('no')
    return res.json({
      steamId: null,
      steamName: null,
    })
  }
})

// Get the entrie friends list from steam
app.get('/steam/friendsList', async (req, res) => {
  if (req.session.steamId) {
    const steamId = req.session.steamId
    const API_KEY = process.env.STEAM_API_KEY
    const data = await axios.get(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${API_KEY}&steamid=${steamId}&relationship=friend`)
    return res.json(data.data.friendslist.friends)
  }
  else {
    console.log('no steam id')
  }
  res.redirect(process.env.FRONTEND_URL)
})

// Endpoints
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.get('/', (req, res) => {
  res.send('hello')
})

// Created Backend route to access the games table from database
app.get('/games', async(req, res) => {
  try {
    // Uses sql command to grab 3 random game ids from the database and corresponding description, name, and header image id then returning json object.
    const { rows } = await pool.query(`SELECT "game_id", "description", "name", "header_image", "metacritic_score", "hltb_score" FROM "Games" ORDER BY RANDOM() LIMIT 3`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching game IDs:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/games/:gameid", async (req, res) => {
  const { gameid } = req.params;

  // Ensure gameid is a valid number
  if (isNaN(Number(gameid))) {
    res.status(400).json({ error: "Invalid game ID format" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT "name", "header_image", "description", "hltb_score", "recommendations", 
              "price", "metacritic_score", "released", "platform"  
       FROM "Games" WHERE "game_id" = $1`,
      [gameid]
    );

    console.log("Query result for gameid:", gameid, rows); // Debugging log

    if (rows.length === 0) {
      res.status(404).json({ error: "Game not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
