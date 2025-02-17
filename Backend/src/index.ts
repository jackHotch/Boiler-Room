import pg from 'pg'
import cors from 'cors'
const express = require('express');
const session = require('express-session');
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg
const port = 8080
const app = express();

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DB_URL,
})
pool.connect()

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,  // Use true for HTTPS in production
      httpOnly: true, // Prevent access to the cookie from JavaScript
      sameSite: 'lax', // Allow cookies in cross-origin requests
      maxAge: 1000 * 60 * 60 * 24, // Session expires in 24 hours
    },
  })
);


app.use(express.json()); // Support for JSON bodies
app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies
app.use(express.json())

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true // Allows sending cookies/sessions
}));



// Go through steams open id process
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

// Receives steam open id data and extracts the steam id of the authed user
// Stores in express session for 24-hours
app.get('/steam', async (req, res) => {
  console.log("Received query params:", req.query);
  const queryParams = req.query;
  const steamId = queryParams['openid.claimed_id'];

  if (!steamId) 
    return res.status(400).send('Steam ID not found');

  let id = steamId.toString();
  id = id.slice(id.lastIndexOf('/id/') + 4); // Adding 4 to skip "/id/"

  // Fetch the steamName asynchronously and store it in the session
  try {
    const response = await axios.get('http://localhost:8080/steam/username', {
      params: { steamid: id }  // Send the steamid in the request
    });

    const steamName = response.data.username || 'Unknown'; // Extract the username
    req.session.steamId = id;
    req.session.steamName = steamName;

    console.log("Steam ID Authenticated: " + req.session.steamId);
    res.redirect("http://localhost:3000");
  } catch (error) {
    console.error('Error fetching Steam username:', error);
    res.status(500).send('Error fetching Steam username');
  }
});

app.get('/steam/username', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId;

  if (!steamId) {
    return res.status(400).send('Steam ID is required');
  }

  try {
    const response = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`, {
      params: {
        key: process.env.STEAM_API_KEY,
        steamids: steamId
      }
    });

    const username = response.data.response.players[0]?.personaname; // Extracting the username

    if (username) {
      res.json({ username });
    } else {
      res.status(404).send('Username not found');
    }
  } catch (error) {
    console.error('Error fetching Steam username:', error);
    res.status(500).send('Error fetching Steam username');
  }
});




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


app.get('/steam/logout', (req, res) => {
  console.log(req.session.steamId);
  console.log("Session Data:", req.session);

  if (req.session.steamId) {
    req.session.steamId = null; 
    req.session.username = null; 
  }
    
 // Redirect the user back to the referring page
 res.redirect('http://localhost:3000');});


 // Used for fetching display card info after login
 app.get('/steam/getdisplayinfo', async (req, res) => {
  if (req.session.steamId && req.session.steamName) {
    // If Steam ID and name are in the session, return them
    return res.json({
      steamId: req.session.steamId,
      steamName: req.session.steamName,
    });
  
  }
  res.redirect('http://localhost:3000');
});

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
  res.redirect('http://localhost:3000')
})

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

// app.get('/supabase', async (req, res) => {
//   const { rows } = await pool.query(`SELECT * FROM test`)
//   res.send(rows[0].message)
// })

// app.get('/people', async(req, res) => {
//   const { rows } = await pool.query(`SELECT * FROM userstest`);
//   const peopleData = rows.map(row => row.people).join('\n');
//   res.send(peopleData);
// })

// Created Backend route to access the games table from database
app.get('/games', async(req, res) => {
  try {
    // Uses sql command to grab 3 random game ids from the database and corresponding description, name, and header image id then returning json object.
    const { rows } = await pool.query(`SELECT "game_id", "description", "name", "header_image" FROM "Games" ORDER BY RANDOM() LIMIT 3`);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching game IDs:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/steam', async (req, res) => {
  const key = process.env.STEAM_API_KEY
  const steamId = 76561198312573287n
  const data = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true `)
  const gamesList = [...data.data.response.games];
  res.send(gamesList)
  //res.send([data.data.response.games[0], data.data.response.games[1], data.data.response.games[2], data.data.response.games[3]])
})

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
