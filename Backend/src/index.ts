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
app.set("trust proxy", 1);

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DB_URL,
})
pool.connect()

export function closeServer() {
  server.close()
  pool.end()
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // unsure how important this key name is, look into
    resave: false,
    saveUninitialized: false,
    proxy: true,
    name: 'steamidSession',
    cookie: {
      secure: useHTTPS, // Use true for HTTPS in production
      httpOnly: !useHTTPS, // Prevent access to the cookie from JavaScript
      sameSite: process.env.SAME_SITE, // Allow cookies in cross-origin requests
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

app.post('/set-session', (req, res) => {
  req.session.steamid = req.body.steamid;
  res.send({ message: 'Session set' });
});

// Go through steams open id process and redirect to steam login, sends back request to our /steam handler route
app.get('/auth/steam', (req, res) => {
  const steamOpenIDUrl = 'https://steamcommunity.com/openid/login'

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0', // OpenID 2.0 namespace
    'openid.mode': 'checkid_setup', // Start the authentication process
    'openid.return_to': `${process.env.BACKEND_URL}/steam`, // Must be the url which recieves the open id info (rn it is /steam)
    'openid.realm': `${process.env.BACKEND_URL}/steam`,
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

  // Redirect to check visibility
  res.redirect(`/steam/validvisibility/${id}`)
})

// Checks visibiltiy of a given steam id
app.get('/steam/validvisibility/:steamId', async (req, res) => {
  const id = req.params.steamId;  // Capture the 'id' parameter from the URL
  let profile_visibilty = await checkAccount(id)
  console.log("Profile vis: " + profile_visibilty)
  switch (profile_visibilty) {
    case 0:
      res.status(200).send(renderMessagePage({
        title: "Don't be a loner...",
        text: "Please set all of your Steam profile to public so we can help curate your game recommendations."
      }));
      break;

    case 1:
      res.status(200).send(renderMessagePage({
        title: "Gatekeeping games...",
        text: "Please set all of your Steam profile to public so we can help curate your game recommendations."
      }));
      break;

    case 2:
      res.status(200).send(renderMessagePage({
        title: "Wow! Looks like you've got no friends...",
        text: "Please set all of your Steam profile to public so we can help curate your game recommendations."
      }));
      break;

    default:
      res.status(200).redirect(`/steam/setsession/${id}`)
      break
  }})


// Sets session variables for a given steam id
app.get('/steam/setsession/:steamId', async (req, res) => {
  const id = req.params.steamId
  // Fetch the steamName asynchronously and store it in the session
  const steamId = BigInt(req.params.steamId); //Set steamid to big Int
  const result = await insertProfile(steamId); //Toss it to the insert profile function

  if (result) { //if we add a profile, 
    await insertGames(steamId); //insert games from that profile
  }
  // continue the set session work
  try {
    const response = await axios.get(process.env.BACKEND_URL + '/steam/playersummary', {
      params: { steamid: id }, // Send the steamid in the request
    })

    req.session.steamId = id
    req.session.steamName = response.data.username
    req.session.steamPFP = response.data.userImage

    console.log('Steam ID Authenticated: ' + req.session.steamId)
    res.redirect(process.env.FRONTEND_URL + "/Dashboard")
  } catch (error) {
    console.error('Error fetching Steam username:', error)
    // Only send one response, error occurs when redirecting back from login error
    if (!res.headersSent) return res.status(500).send('Error fetching Steam username');
  }
})

app.get('/steam/loggedin', async (req, res) => {
  if (req.session.steamId)
    res.send(true)
})

// Gets username and profile picture from steam api using session steam ID
app.get('/steam/playersummary', async (req, res) => {
  //this should be depreciated now that async function insertProfile handles it now???
  const steamId = req.query.steamid || req.session.steamId

  if (!steamId) return res.status(400).send('Steam ID is required')
  
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
    const userImage = response.data.response.players[0]?.avatarfull
    console.log(userImage)
    if (username) {
      res.status(200).json({ username: username, userImage: userImage })
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
    res.status(200).send(games);
  } catch (error) {
    console.error("Error fetching Steam data:", error);
    res.redirect(process.env.FRONTEND_URL);
  }
});

// "Logout" i.e. remove steam id and name from session storage
app.get('/steam/logout', (req, res) => {
  console.log(req.session.steamId)
  console.log('Session Data:', req.session)

  if (req.session.steamId) {
    req.session.steamId = null
    req.session.username = null
    req.session.steamPFP = null
  }

  // Redirect the user back to the referring page
  res.redirect(process.env.FRONTEND_URL)
})

// Used for fetching display card info after login
app.get('/steam/getdisplayinfo', async (req, res) => {
  // If Steam ID and name are in the session, return them
  if (req.session.steamId && req.session.steamName) {
    console.log("ID: " + req.session.steamId)
    console.log("Steam Name: " + req.session.steamName)
    console.log("Steam PFP URL: " + req.session.steamPFP)

    return res.json({
      steamId: req.session.steamId,
      steamName: req.session.steamName,
      steamPFP: req.session.steamPFP
    })
  } else {
    console.log('no')
    return res.json({
      steamId: null
    })
  }
})

// Get the entrie friends list from steam
app.get('/steam/friendsList', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId
  if (steamId) {
    const API_KEY = process.env.STEAM_API_KEY
    const data = await axios.get(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${API_KEY}&steamid=${steamId}&relationship=friend`)
    return res.status(200).json(data.data.friendslist.friends)
  }
  else {
    console.log('no steam id')
    res.sendStatus(400)
  }
})

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.get('/', (req, res) => {
  if (req.session.steamid != null)
    res.redirect(process.env.FRONTEND_URL + '/Dashboard')
  else
    res.redirect(process.env.FRONTEND_URL)
})

// Created Backend route to access the games table from database
app.get('/games', async(req, res) => {
  try {
    // Uses sql command to grab 3 random game ids from the database and corresponding description, name, and header image id then returning json object.
    const { rows } = await pool.query(`SELECT "game_id", "description", "name", "header_image", "metacritic_score", "hltb_score" FROM "Games" ORDER BY RANDOM() LIMIT 3`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching game IDs:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/games/:gameid", async (req, res) => {
  const { gameid } = req.params;

  // Ensure gameid is a valid number
  if (isNaN(Number(gameid))) {
    return res.status(400).json({ error: "Invalid game ID format" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT "name", "header_image", "description", "hltb_score", "recommendations", 
              "price", "metacritic_score", "released", "platform"  
       FROM "Games" WHERE "game_id" = $1`,
      [gameid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export async function insertProfile(steamId: bigint) {
  try { // Firstly we check to make sure we dont have a profile already
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM "Profiles" WHERE "steam_id" = $1', [steamId]
    );

    if (existingRows.length > 0) {
      return false;  //if we do, throw a false and move on
    }

    const response = await axios.get( //otherwise get some information
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`,
      {
        params: {
          key: process.env.STEAM_API_KEY, //thanks trevor for doing the work for me
          steamids: steamId,
        },
      }
    );

    const avatar = response.data.response.players[0]?.avatarhash; //isolate the 2 things we use
    const userName = response.data.response.players[0]?.personaname;

    await pool.query( // Insert those things along with the steamID to our database
      'INSERT INTO "Profiles" ("steam_id", "username", "avatar_hash") VALUES ($1, $2, $3) RETURNING *', [steamId, userName, avatar]
    );

    return true; //set true
  } catch (error) {
    console.error('Error executing query', error); //catch errors that may occur
    throw new Error('Internal Server Error');
  }
}

export async function insertGames(steamId: bigint) {
  // Theres going to be a lot of commented out console logs here because I had to hunt stuff down
  try {
    //console.log(`Starting insertGames for steamId: ${steamId}`); 
    //console.log('Fetching games from Steam API...');
    const response = await axios.get( //make our game request
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`,
      {
        params: {
          key: process.env.STEAM_API_KEY,
          steamid: steamId,
          format: 'json',
          include_appinfo: true,
          include_played_free_games: true,
        },
      }
    );
    //console.log('Steam API response:', response.data);

    const games = response.data.response.games; // the games we get are saved here

    if (!games || games.length === 0) { //if the length is 0, user has no games
      console.log('No games found for this user.');
      return { success: false, message: 'No games found for this user.' };
    } //likely redundant since other areas should check for this

    const gameIds = games.map(game => game.appid); //maps all the app.ids to a new array
    //console.log('Game IDs from Steam API:', gameIds);
    //console.log('Data type of game IDs from Steam API:', typeof gameIds[0]);

    //console.log('Fetching existing games from the database...');
    const existingGames = await pool.query(
      'SELECT "game_id" FROM "Games" WHERE "game_id" = ANY($1)', [gameIds]
    ); //uses that array to get all of the existing games from the steam database

    //console.log('Existing games in database:', existingGames.rows);
    //console.log('Data type of game IDs in database:', typeof existingGames.rows[0]?.game_id);

    //make a new set of string of gameIds
    const existingGameIds = new Set(existingGames.rows.map(row => String(row.game_id)));
    //console.log('Existing game IDs:', existingGameIds);

    //get a string array of only games both user has and are in our database
    const validGames = games.filter(game => existingGameIds.has(String(game.appid)));
    //console.log('Valid games (existing in database):', validGames);

    if (validGames.length === 0) { //another check here just in case
      console.log('No valid games found to insert/update.');
      console.log('This means none of the games returned by the Steam API exist in the Games table.');
      return { success: false, message: 'No valid games found to insert/update.' };
    }

    const values = validGames // Makes a flatmap array of all the valid to enter user games
      .map((game, index) => [
        game.appid,
        steamId,
        game.playtime_forever || 0, //default playtime of 0
      ])
      .flat();

    //console.log('Batch insert/update values:', values);

    const placeholders = validGames //makes a fun dynamic array to batch query up games
      .map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`)
      .join(',');

    //console.log('Placeholders for batch query:', placeholders);

    const query = `
      INSERT INTO "User_Games" ("game_id", "steam_id", "total_played")
      VALUES ${placeholders}
      ON CONFLICT ("game_id", "steam_id")
      DO UPDATE SET "total_played" = EXCLUDED."total_played"
    `; //insert our games and on conflict (already exists) update total play time

    //console.log('Constructed batch query:', query);

    //console.log('Executing batch query...');
    const result = await pool.query(query, values);

    console.log('Batch query result:', result);

    //console.log(`Inserted/Updated ${validGames.length} rows.`);

    return { success: true, message: 'Games inserted/updated successfully.' };
  } catch (error) {
    console.error('Error in insertGames:', error);
    throw new Error('Internal Server Error');
  }
}

export async function checkAccount(steamId) {
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

      if (gameResponse.data.response && Object.keys(gameResponse.data.response).length > 0) {
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

      if (friendsResponse.data.friendslist) {  
        retVal += 1; 
    }
  } catch (error) {
      console.error("Error fetching Steam API:", error);
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

// For profile visibilty errors
const renderMessagePage = (message) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Steam Profile Setup</title>
        <style>
          body {
            background-color: #121212;
            color: #f0f0f0;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 40px;
          }
          h1 {
            color: #ff5733;
            font-size: 24px;
          }
          p {
            font-size: 16px;
            margin-top: 15px;
          }
          button {
            background-color: #ff5733;
            color: white;
            font-size: 16px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
          }
          button:hover {
            background-color: #e04e28;
          }
        </style>
      </head>
      <body>
        <h1>${message.title}</h1>
        <p>${message.text}</p>
        <button onclick="window.location.href='${process.env.BACKEND_URL + '/auth/steam'}'"><strong>Try Again</strong></button>
      </body>
    </html>
  `;
}

export default app
