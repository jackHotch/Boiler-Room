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
    console.log('Fetched username:', username);

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

app.get('/steam/friendsList', async (req, res) => {
  if (req.session.steamId) {
    const steamId = req.session.steamId
    console.log("hello" + steamId)
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
