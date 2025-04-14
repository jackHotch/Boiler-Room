import pg from 'pg'
import cors from 'cors'
const express = require('express')
const session = require('express-session')
import axios from 'axios'
import dotenv from 'dotenv'
const { lockoutMiddleware, releaseLockout } = require('./middleware/lockoutMiddleware')

export const { Pool } = pg //Jonathan added the export, not sure if this will create other problems
const port = 8080
const app = express()

dotenv.config()

// Determine true/false from USE_HTTPS .env variable
var useHTTPS = process.env.USE_HTTPS?.toLowerCase?.() === 'true'

app.use(express.json()) // Support for JSON bodies
app.use(express.urlencoded({ extended: true })) // Support URL-encoded bodies
app.set('trust proxy', 1)

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

app.use(function (req, res, next) {
  res.set('credentials', 'include')
  res.set('Access-Control-Allow-Credentials', true)
  res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  next()
})

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allows sending cookies/sessions
  })
)

app.post('/set-session', (req, res) => {
  req.session.steamid = req.body.steamid
  res.send({ message: 'Session set' })
})

// Go through steams open id process and redirect to steam login, sends back request to our /steam handler route
app.get('/auth/steam', (req, res) => {
  const steamOpenIDUrl = 'https://steamcommunity.com/openid/login'

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0', // OpenID 2.0 namespace
    'openid.mode': 'checkid_setup', // Start the authentication process
    'openid.return_to': `${process.env.BACKEND_URL}/steam`, // Must be the url which recieves the open id info (rn it is /steam)
    'openid.realm': `${process.env.BACKEND_URL}`,
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
  const id = req.params.steamId // Capture the 'id' parameter from the URL
  let profile_visibilty = await checkAccount(id)
  console.log('Profile vis: ' + profile_visibilty)
  switch (profile_visibilty) {
    case 0:
      res.status(200).send(
        renderMessagePage({
          title: "Don't be a loner...",
          text: 'Please set all of your Steam profile to public so we can help curate your game recommendations.',
        })
      )
      break

    case 1:
      res.status(200).send(
        renderMessagePage({
          title: 'Gatekeeping games...',
          text: 'Please set all of your Steam profile to public so we can help curate your game recommendations.',
        })
      )
      break

    case 2:
      res.status(200).send(
        renderMessagePage({
          title: "Wow! Looks like you've got no friends...",
          text: 'Please set all of your Steam profile to public so we can help curate your game recommendations.',
        })
      )
      break

    default:
      res.redirect(`/steam/setsession/${id}`)
      break
  }
})

// Sets session variables for a given steam id
app.get('/steam/setsession/:steamId', async (req, res) => {
  const id = req.params.steamId

  console.log('Steam ID in SetSession: ' + id)
  // Fetch the steamName asynchronously and store it in the session
  const steamId = BigInt(req.params.steamId) //Set steamid to big Int
  const result = await insertProfile(steamId) //Toss it to the insert profile function

  if (result) {
    //if we add a profile,
    await insertGames(steamId) //insert games from that profile
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
    res.redirect(process.env.FRONTEND_URL + '/Dashboard')
  } catch (error) {
    console.error('Error in steam/setsession:', error)
    if (!res.headersSent) {
      return res.status(500).send('Error processing Steam authentication')
    }
  }
})

export async function insertProfile(steamId: bigint) {
  try {
    //firstly we check to make sure we dont have a profile already
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM "Profiles" WHERE "steam_id" = $1',
      [steamId]
    )

    if (existingRows.length > 0) {
      return false //if we do, throw a false and move on
    }

    await pool.query(
      'INSERT INTO "Buffer_Profiles" ("steam_id") VALUES ($1) ON CONFLICT ("steam_id") DO NOTHING',
      [steamId]
    )

    const response = await axios.get(
      //otherwise get some information
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`,
      {
        params: {
          key: process.env.STEAM_API_KEY, //thanks trevor for doing the work for me
          steamids: steamId,
        },
      }
    )

    const avatar = response.data.response.players[0]?.avatarhash //isolate the 2 things we use
    const userName = response.data.response.players[0]?.personaname

    const overallStart = Date.now()

    for (let i = 0; i < 3; i++) {
      const iterationStart = Date.now()
      console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

      await sleep(i * 1000)

      const iterationEnd = Date.now()
      const iterationElapsed = (iterationEnd - iterationStart) / 1000
      console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
    }

    await pool.query(
      //insert those things along with the steamID to our database
      'INSERT INTO "Profiles" ("steam_id", "username", "avatar_hash") VALUES ($1, $2, $3) RETURNING *',
      [steamId, userName, avatar]
    )

    return true //set true
  } catch (error) {
    console.error('Error executing query', error) //catch errors that may occur
    throw new Error('Internal Server Error')
  }
}

app.get('/steam/loggedin', async (req, res) => {
  if (req.session.steamId) res.send(true)
})

// Gets username and profile picture from steam api using session steam ID

app.get('/steam/playersummary', async (req, res) => {
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

    const overallStart = Date.now()

    for (let i = 0; i < 3; i++) {
      const iterationStart = Date.now()
      console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

      await sleep(i * 1000)

      const iterationEnd = Date.now()
      const iterationElapsed = (iterationEnd - iterationStart) / 1000
      console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
    }

    const username = response.data.response.players[0]?.personaname
    const userImage = response.data.response.players[0]?.avatarfull

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
  const steamId = req.query.steamid || req.session.steamId
  const key = process.env.STEAM_API_KEY

  try {
    const { data } = await axios.get(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/`,
      {
        params: {
          key: key,
          steamid: steamId,

          format: 'json',
        },
      }
    )

    const overallStart = Date.now()

    for (let i = 0; i < 2; i++) {
      const iterationStart = Date.now()
      console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

      await sleep(i * 1000)

      const iterationEnd = Date.now()
      const iterationElapsed = (iterationEnd - iterationStart) / 1000
      console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
    }

    const overallEnd = Date.now()
    const totalElapsed = (overallEnd - overallStart) / 1000
    console.log(`Total execution time: ${totalElapsed.toFixed(2)} seconds`)

    console.log('Done')

    const games = data.response.games?.slice(0, 3) || []
    res.status(200).send(games)
  } catch (error) {
    console.error('Error fetching Steam data:', error)
    res.redirect(process.env.FRONTEND_URL)
  }
})

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

// Return steam id if logged in, else null
app.get('/steam/logininfo', async (req, res) => {
  // If Steam ID and name are in the session, return them
  if (req.session.steamId) {
    return res.json({
      steamId: req.session.steamId,
    })
  } else {
    return res.json({
      steamId: null,
    })
  }
})

// Used for fetching display card info after login
app.get('/steam/getdisplayinfo', async (req, res) => {
  // If Steam ID and name are in the session, return them

  if (req.session.steamId && req.session.steamName) {
    return res.json({
      steamId: req.session.steamId,
      steamName: req.session.steamName,
      steamPFP: req.session.steamPFP,
    })
  } else {
    return res.json({
      steamId: null,
    })
  }
})

// Get the entrie friends list from steam
app.get('/steam/friendsList', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId
  if (steamId) {
    const API_KEY = process.env.STEAM_API_KEY
    const data = await axios.get(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${API_KEY}&steamid=${steamId}&relationship=friend`
    )
    const overallStart = Date.now()

    for (let i = 0; i < 3; i++) {
      const iterationStart = Date.now()
      console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

      await sleep(i * 1000)

      const iterationEnd = Date.now()
      const iterationElapsed = (iterationEnd - iterationStart) / 1000
      console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
    }
    return res.status(200).json(data.data.friendslist.friends)
  } else {
    console.log('no steam id')
    res.sendStatus(400)
  }
})

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.get('/', (req, res) => {
  if (req.session.steamid != null) res.redirect(process.env.FRONTEND_URL + '/Dashboard')
  else res.redirect(process.env.FRONTEND_URL)
})

// Created Backend route to access the games table from database
app.get('/games', async (req, res) => {
  try {
    // Uses sql command to grab 3 random game ids from the database and corresponding description, name, and header image id then returning json object.
    const { rows } = await pool.query(
      `SELECT "game_id", "description", "name", "header_image", "metacritic_score", "hltb_score" FROM "Games" ORDER BY RANDOM() LIMIT 3`
    )
    res.status(200).json(rows)
  } catch (error) {
    console.error('Error fetching game IDs:', error)
    res.status(500).json({ error: error.message })
  }
})

//Create Backend route to retrieve game by game's id
app.get('/games/:gameid', async (req, res) => {
  const { gameid } = req.params

  // Ensure gameid is a valid number
  if (isNaN(Number(gameid))) {
    return res.status(400).json({ error: 'Invalid game ID format' })
  }

  try {
    const { rows } = await pool.query(
      `SELECT g."name", g."header_image", g."description", g."hltb_score", 
       r."total", r."positive", r."negative", r."description" AS recommendation_description,
       g."price", g."metacritic_score", g."released", g."platform", g."boil_score"
      FROM "Games" g
      LEFT JOIN "Game_Recommendations" r ON g."game_id" = r."game_id"
      WHERE g."game_id" = $1`,
      [gameid]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' })
    }

    const platformMap = {
      1: ['Linux'],
      2: ['Mac'],
      3: ['Linux, ', 'Mac'],
      4: ['Windows'],
      5: ['Linux, ', 'Windows'],
      6: ['Windows, ', 'Mac'],
      7: ['Linux, ', 'Mac, ', 'Windows'],
    }

    const monthMap = {
      1: 'January',
      2: 'February',
      3: 'March',
      4: 'April',
      5: 'May',
      6: 'June',
      7: 'July',
      8: 'August',
      9: 'September',
      10: 'October',
      11: 'November',
      12: 'December',
    }

    // Create API response for Review Color
    if (rows[0].positive && rows[0].total) {
      let positive = Number(rows[0].positive)
      let total = Number(rows[0].total)
      let ratio = total > 0 ? (positive / total) * 100 : 0

      if (ratio >= 70) {
        rows[0].review_color = 'green'
      } else if (ratio >= 40) {
        rows[0].review_color = 'yellow'
      } else {
        rows[0].review_color = 'red'
      }
    }
    console.log('Query result for gameid:', gameid, rows) // Debugging log

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' })
    }
    console.log(rows[0].description)
    if (rows.length > 0 && rows[0].released) {
      // If 'released' is a Date object, convert it to ISO string before splitting
      rows[0].released =
        typeof rows[0].released === 'string'
          ? rows[0].released.split('T')[0] // Already a string, just split
          : rows[0].released.toISOString().split('T')[0] // Convert Date to string, then split
      let year = rows[0].released.split('-')[0]
      let month = rows[0].released.split('-')[1]
      let day = rows[0].released.split('-')[2]
      rows[0].released = `${monthMap[Number(month)]} ${day}, ${year}`
    }
    //if (rows[0].recommendations == 'depreciated') rows[0].recommendations = 'Unavailable'
    rows[0].platform = platformMap[rows[0].platform] || ['Unknown']
    return res.status(200).json(rows[0])
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/featuredgames', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "game_id", "description", "name", "header_image", "metacritic_score", "hltb_score", "boil_score" 
      FROM "Games" 
      WHERE "game_id" IN
        (SELECT "game_id"
        FROM "Games" 
        ORDER BY "boil_score" DESC NULLS LAST
        LIMIT 500)
      ORDER BY RANDOM() LIMIT 3`
    )

    res.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/usergames', async (req, res) => {
  const getHidden = req.query.getHidden // converts query string to boolean
  const steamId = req.session.steamId

  try {
    let hideCondition
    // Check if getHidden is '2', meaning fetch all games
    if (getHidden)
      hideCondition = getHidden === '2' ? '1 = 1' : `ug."hide" = ${getHidden ? 1 : 0}`

    const { rows } = await pool.query(
      `SELECT ug."steam_id", g."game_id", ug."total_played", ug."hide", g."name", g."header_image", g."released",
              r."total", r."positive", r."negative", r."description" AS recommendation_description, 
              g."metacritic_score", g."hltb_score", g."boil_score"
         FROM "Games" g 
         JOIN "User_Games" ug ON g."game_id" = ug."game_id"
         LEFT JOIN "Game_Recommendations" r ON g."game_id" = r."game_id"
        WHERE ug."steam_id" = $1 AND ${hideCondition}
        ORDER BY g."boil_score" DESC NULLS LAST;
      `,
      [steamId]
    )

    res.json(rows)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/ownedGames', async (req, res) => {
  console.log('Session Object:', req.session)
  console.log('Steam ID:', req.session.steamId)

  if (!req.session.steamId) {
    console.log('No Steam Id Found in Session - /ownedGames')
    return res.status(401).json({ error: 'No Steam ID found. Please log in.' })
  }

  const steamId = req.session.steamId
  const KEY = process.env.STEAM_API_KEY
  if (!KEY) {
    console.error('STEAM_API_KEY is not set in environment variables')
    return res
      .status(500)
      .json({ error: 'Server configuration error: Missing Steam API key.' })
  }

  try {
    console.log('Making Steam API Request with steamId:', steamId)
    const gameResponse = await axios.get(
      'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/',
      {
        params: {
          steamid: steamId,
          key: process.env.STEAM_API_KEY,
          format: 'json',
          include_appinfo: true,
          include_played_free_games: true,
        },
      }
    )
    const overallStart = Date.now()

    for (let i = 0; i < 3; i++) {
      const iterationStart = Date.now()
      console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

      await sleep(i * 1000)

      const iterationEnd = Date.now()
      const iterationElapsed = (iterationEnd - iterationStart) / 1000
      console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
    }

    const overallEnd = Date.now()
    const totalElapsed = (overallEnd - overallStart) / 1000
    console.log(`Total execution time: ${totalElapsed.toFixed(2)} seconds`)

    console.log('Done')
    const data = gameResponse.data
    if (!data.response || !data.response.games) {
      return res.status(404).json({ error: 'No owned games found for this user.' })
    }

    const ownedGames = data.response.games.map((game) => ({
      id: game.appid,
      title: game.name,
      header_image: `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`,
      playtime_forever: game.playtime_forever || 0, // Include playtime in minutes (default to 0 if not present)
      playtime_2weeks: game.playtime_2weeks || 0,
    }))

    return res.json(ownedGames)
  } catch (error) {
    console.error(
      'Error fetching owned games from Steam API:',
      error.message,
      error.response?.data
    )
    return res.status(500).json({ error: 'Failed to fetch owned games from Steam API.' })
  }
})

//Request to allow for searching for a game by name
app.get('/gamesByName', async (req, res) => {
  try {
    const { name } = req.query // Get the search term from query parameters

    const { rows } = await pool.query(
      `SELECT "name", "header_image", "game_id", "metacritic_score", "hltb_score", "boil_score"
       FROM "Games" 
       WHERE name ILIKE $1`,
      [`%${name}%`] // Use parameterized query with wildcards for partial match
    )
    console.log('Rows for search: ' + rows[0].name)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

//Request to retrieve games based on filtering parameters
app.get('/gamesByFilter', async (req, res) => {
  try {
    //Dissects values returned from frontend
    let { minBoilRating, minYear, maxYear, platform, genre, maxHLTB, steamId } = req.query

    // Ensure numbers are properly converted
    minBoilRating = parseFloat(minBoilRating) || -1
    maxHLTB = parseInt(maxHLTB, 10) || 10000
    const { rows } = await pool.query(
      `SELECT g."name", g."header_image", g."description", g."boil_score", g."released", g."game_id"
       FROM "Games" g
       JOIN "Game_Genres" gg ON gg.games = g.game_id 
       JOIN "Genres" gen ON gen.id = gg.genres
       WHERE g.boil_score > $2
         AND EXISTS (
            SELECT 1
            FROM unnest($7::smallint[]) AS user_platform
            WHERE g.platform & user_platform <> 0
          ) --Using bitwise and (&) for operation
         AND g.hltb_score <= $5
         AND gen.description = ANY($1::text[])
         AND NOT EXISTS (
            SELECT *
            FROM "User_Games" ug
            WHERE g.game_id = ug.game_id
            AND ug.steam_id = $6)
          AND g.released BETWEEN $3 AND $4
       Group BY g."name", g."header_image", g."description", g."boil_score", g."released", g."game_id"
       HAVING COUNT(DISTINCT gen.description) = array_length($1::text[],1)
       ORDER BY g."boil_score" DESC
       LIMIT 9;`,
      [genre, minBoilRating, minYear, maxYear, maxHLTB, steamId, platform]
    )

    res.json(rows)
  } catch (error) {
    console.error('Error fetching games:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

//Request to retrieve user's most common game specs for default new game recommendations
app.get('/userGameSpecs', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId

  try {
    const { rows } = await pool.query(
      `SELECT gen.description AS most_common_genre,
          COUNT(gen.description) AS genre_count,
          (SELECT g.platform
              FROM "User_Games" ug2
              JOIN "Games" g ON ug2.game_id = g.game_id
              WHERE ug2.steam_id = $1
              GROUP BY g.platform
              ORDER BY COUNT(*) DESC
              LIMIT 1
          ) AS most_common_platform,
          --AVG(g.hltb_score) AS avg_hltb
          ROUND(AVG(g.hltb_score)::numeric, 2) AS avg_hltb
      FROM "User_Games" ug
      JOIN "Game_Genres" gg ON ug.game_id = gg.games
      JOIN "Genres" gen ON gg.genres = gen.id
      JOIN "Games" g ON ug.game_id = g.game_id
      WHERE ug.steam_id = $1
      GROUP BY gen.description
      ORDER BY genre_count DESC
      LIMIT 1;`,
      [steamId]
    )

    res.status(200).json(rows)
  } catch (error) {
    console.error('Error fetching specs:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

export async function insertGames(steamId: bigint, friend: boolean = true) {
  const useKey = friend ? process.env.FRIENDS_API_KEY : process.env.STEAM_API_KEY

  try {
    const response = await axios.get(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`,
      {
        params: {
          key: useKey,
          steamid: steamId,
          format: 'json',
          include_appinfo: true,
          include_played_free_games: true,
        },
      }
    )
    //console.log('Steam API response:', response.data);

    const games = response.data.response.games // the games we get are saved here

    if (!games || games.length === 0) {
      //if the length is 0, user has no games
      console.log('No games found for this user.')
      return { success: false, message: 'No games found for this user.' }
    } //likely redundant since other areas should check for this

    //console.log('Game IDs from Steam API:', gameIds);
    //console.log('Data type of game IDs from Steam API:', typeof gameIds[0]);
    const gameIds = games.map((game) => game.appid) // Maps all the app.ids to a new array

    // Get existing games from our database
    const existingGames = await pool.query(
      'SELECT "game_id" FROM "Games" WHERE "game_id" = ANY($1)',
      [gameIds]
    )

    const existingGameIds = new Set(existingGames.rows.map((row) => String(row.game_id)))

    // Filter valid games for User_Games (existing in our database)
    const validGames = games.filter((game) => existingGameIds.has(String(game.appid)))

    // Filter games for Buffer_Games:
    // 1. Not in our database
    // 2. Don't have content_descriptorids 1, 3, or 4
    const bufferGames = games.filter((game) => {
      const isNotInDatabase = !existingGameIds.has(String(game.appid))
      const hasInvalidContent =
        game.content_descriptorids &&
        game.content_descriptorids.some((id) => [1, 3, 4].includes(id))
      return isNotInDatabase && !hasInvalidContent
    })

    // Process User_Games insertion if there are valid games
    if (validGames.length > 0) {
      const userGamesValues = validGames
        .map((game, index) => [game.appid, steamId, game.playtime_forever || 0])
        .flat()

      const userGamesPlaceholders = validGames
        .map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`)
        .join(',')

      const userGamesQuery = `
        INSERT INTO "User_Games" ("game_id", "steam_id", "total_played")
        VALUES ${userGamesPlaceholders}
        ON CONFLICT ("game_id", "steam_id")
        DO UPDATE SET "total_played" = EXCLUDED."total_played"
      `

      await pool.query(userGamesQuery, userGamesValues)
      console.log(`Inserted/Updated ${validGames.length} rows in User_Games.`)
    }

    // Process Buffer_Games insertion if there are buffer games
    if (bufferGames.length > 0) {
      const bufferValues = bufferGames.map((game) => game.appid).flat()

      const bufferPlaceholders = bufferGames
        .map((_, index) => `($${index + 1})`)
        .join(',')

      const bufferQuery = `
        INSERT INTO "Buffer_Games" ("game_id")
        VALUES ${bufferPlaceholders}
        ON CONFLICT ("game_id") DO NOTHING
      `

      await pool.query(bufferQuery, bufferValues)
      console.log(`Inserted ${bufferGames.length} rows into Buffer_Games.`)
    }

    if (validGames.length === 0 && bufferGames.length === 0) {
      console.log('No valid games found to insert')
      return {
        success: false,
        message: 'No valid games found to insert',
      }
    }

    return {
      success: true,
      message: `Games inserted/updated successfully.`,
    }
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('Rate limited encountered')
      return {
        __handled429: true,
        message: 'Rate limit exceeded',
      }
    } else {
      console.error('Error in insertGames:', error)
      throw new Error('Internal Server Error')
    }
  }
}

app.get('/resyncHelper', async (req, res) => {
  const steamId = req.query.steamId || req.session.steamId
  try {
    console.log('Syncing friends')
    const forced = req.query.forced === 'true'
    await loadFriends(steamId, forced)
  } catch (error) {
    console.error('Error in /resyncHelper:', error)
    res.status(500).json({ error: 'Failed to load friends' })
  }

  try {
    console.log('Syncing games')
    insertGames(steamId)
  } catch (error) {
    console.error('Error in /resyncHelper:', error)
    res.status(500).json({ error: 'Failed to load friends' })
  }
  console.log('Finished resyncing')
})

app.get('/friendsListInfo', async (req, res) => {
  const steamId = req.query.steamId || req.session.steamId
  try {
    const forced = req.query.forced === 'false'
    const result = await loadFriends(steamId, forced)
    res.status(200).json(result)
  } catch (error) {
    console.error('Error in /friendsListInfo:', error)
    res.status(500).json({ error: 'Failed to load friends' })
  }
})

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function manageLockout(): Promise<string | null> {
  const selectResult = await pool.query('SELECT "code" FROM "Lockout"') //check lockout status
  const row = selectResult.rows[0]
  const currentStatus = row.code

  if (currentStatus === 1) {
    //if lockout is 1 then you cannot continue
    return 'You are presently locked out, please try again later'
  } else if (currentStatus === 0) {
    //if it is 0 then you may start

    console.log('Beginning querying')
    await pool.query('UPDATE "Lockout" SET "code" = 1', []) //start by locking anyone else out
    return null
  }
}

export async function fetchAndProcessFriends(steamId: bigint, forced: boolean = false) {
  const friendsResponse = await axios.get(
    'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/',
    {
      params: {
        steamid: steamId,
        relationship: 'friend',
        key: process.env.STEAM_API_KEY,
      },
    }
  ) //starts by getting your friends list

  //console.log(friendsResponse.data)

  const overallStart = Date.now()

  for (let i = 0; i < 3; i++) {
    const iterationStart = Date.now()
    console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

    await sleep(i * 1000)

    const iterationEnd = Date.now()
    const iterationElapsed = (iterationEnd - iterationStart) / 1000
    console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
  }
  const steamIds = friendsResponse.data.friendslist.friends
    .map((friend) => friend.steamid.toString())
    .slice(0, 5)
  //console.log(steamIds)

  if (forced) {
    return steamIds //if it is forced mode then we are updating EVERYTHING
  }

  const relationsQuery = `
    SELECT "user1", "user2" 
    FROM "User_Relations" 
    WHERE ("user1" = $1 AND "user2" = ANY($2)) 
       OR ("user2" = $1 AND "user1" = ANY($2))
  `
  const { rows: existingRelations } = await pool.query(relationsQuery, [
    steamId.toString(),
    steamIds,
  ])

  const existingRelatedIds = existingRelations.map((row) =>
    row.user1 === steamId.toString() ? row.user2 : row.user1
  )

  return steamIds.filter((id) => !existingRelatedIds.includes(id)) //otherwise we are going to get accounts where there isnt a relation with you already
}

export async function fetchAndStoreProfiles(userIdsToCheck: string[]) {
  const existingProfilesQuery = ` 
    SELECT steam_id::text 
    FROM "Profiles" 
    WHERE steam_id = ANY($1::bigint[])
  ` //double check that someone doesnt already have a profile

  const userIdsAsBigints = userIdsToCheck.map((id) => BigInt(id))

  const { rows: existingProfiles } = await pool.query(existingProfilesQuery, [
    userIdsAsBigints,
  ])

  const existingProfileIds = existingProfiles.map((row) => row.steam_id)
  const idsToFetch = userIdsToCheck.filter((id) => !existingProfileIds.includes(id))

  const newUserProfiles = [] //these are going to be the new accounts we need to setup
  for (const steamId of idsToFetch) {
    try {
      const response = await axios.get(
        `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`,
        {
          params: {
            key: process.env.STEAM_API_KEY,
            steamids: steamId,
          },
        }
      ) //get their account info

      const avatar = response.data.response.players[0]?.avatarhash
      const userName = response.data.response.players[0]?.personaname

      newUserProfiles.push({
        steamId,
        userName,
        avatar,
      })

      const overallStart = Date.now()

      for (let i = 0; i < 3; i++) {
        const iterationStart = Date.now()
        console.log(
          `Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`
        )

        await sleep(i * 1000)

        const iterationEnd = Date.now()
        const iterationElapsed = (iterationEnd - iterationStart) / 1000
        console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
      } //always making sure we sleep
    } catch (error) {
      await pool.query('UPDATE "Lockout" SET "code" = 0', [])
      console.error(`Error processing Steam ID ${steamId}:`, error.message)
    }
  }

  console.log(newUserProfiles)
  if (newUserProfiles.length > 0) {
    //if there is anyone there we add them in
    await pool.query(
      `INSERT INTO "Profiles" ("steam_id", "username", "avatar_hash")
      SELECT * FROM UNNEST($1::bigint[], $2::text[], $3::text[])`,
      [
        newUserProfiles.map((profile) => BigInt(profile.steamId)),
        newUserProfiles.map((profile) => profile.userName),
        newUserProfiles.map((profile) => profile.avatar),
      ]
    )
  }
}

export async function updateUserRelations(steamId: string, steamIds: string[]) {
  const ourSteamId = steamId //now we need to update our user relations
  const relationsData = steamIds.map((currentSteamId) => {
    const user1 =
      BigInt(currentSteamId) < BigInt(ourSteamId) ? currentSteamId : ourSteamId
    const user2 =
      BigInt(currentSteamId) > BigInt(ourSteamId) ? currentSteamId : ourSteamId
    const status = 3
    return [user1, user2, status]
  })

  if (relationsData.length > 0) {
    //if there is anyone to add, add them
    await pool.query(
      `INSERT INTO "User_Relations" ("user1", "user2", "status")
      SELECT * FROM UNNEST($1::bigint[], $2::bigint[], $3::int[])
      ON CONFLICT DO NOTHING`,
      [
        relationsData.map((row) => BigInt(row[0])),
        relationsData.map((row) => BigInt(row[1])),
        relationsData.map((row) => row[2]),
      ]
    )
  }
}

export async function processAndStoreGames(userIdsToCheck: string[]) {
  console.log(
    `Starting processAndStoreGames with ${userIdsToCheck.length} users:`,
    userIdsToCheck
  )

  // Initial insert for all games
  console.log('Starting initial insertGames for all users')
  userIdsToCheck.forEach((steamId) => {
    //console.log(`Calling insertGames for SteamID: ${steamId}`);
    const steamIdBigInt = BigInt(steamId)
    const friends = true
    insertGames(steamIdBigInt, friends)
  })

  for (const steamId of userIdsToCheck) {
    const steamIdBigInt = BigInt(steamId)
    //console.log(`\n=== Processing Steam ID: ${steamIdBigInt} (${typeof steamIdBigInt}) ===`);

    try {
      // API Request
      //console.log(`Making API request for SteamID ${steamId}`);
      const { data } = await axios.get(
        `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/`,
        {
          params: {
            key: process.env.STEAM_API_KEY,
            steamid: steamId,
            format: 'json',
          },
        }
      )
      //console.log('API Response:', JSON.stringify(data, null, 2));

      const overallStart = Date.now()

      for (let i = 0; i < 3; i++) {
        const iterationStart = Date.now()
        console.log(
          `Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`
        )

        await sleep(i * 1000)

        const iterationEnd = Date.now()
        const iterationElapsed = (iterationEnd - iterationStart) / 1000
        console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
      }
      //console.log('Delay completed');

      // Check response structure
      if (!data.response) {
        console.log(`No response object for Steam ID ${steamId}`)
        continue
      }

      if (!data.response.games || !Array.isArray(data.response.games)) {
        console.log(`No games array found for Steam ID ${steamId}`)
        //console.log('Full response:', JSON.stringify(data.response, null, 2));
        continue
      }

      console.log(`Found ${data.response.games.length} recently played games`)

      // Transform game data
      const recentlyPlayedGames = data.response.games.map((game) => {
        const transformed = {
          steamId: steamIdBigInt.toString(),
          gameId: game.appid.toString(),
          playtime2Weeks: game.playtime_2weeks || 0,
          playtimeForever: game.playtime_forever || 0,
        }
        //console.log(`Game transformed:`, transformed);
        return transformed
      })

      const recentlyPlayedGameIds = recentlyPlayedGames.map((game) =>
        game.gameId.toString()
      )
      //console.log('Recently played game IDs:', recentlyPlayedGameIds);

      // Check existing games in DB
      //console.log(`Checking existing games in DB for SteamID ${steamId}`);
      const existingUserGames = await pool.query(
        'SELECT "game_id"::text FROM "User_Games" WHERE "steam_id" = $1',
        [steamIdBigInt.toString()]
      )

      //console.log(`Found ${existingUserGames.rows.length} existing games in DB`);
      const existingGameIds = existingUserGames.rows.map((row) => row.game_id.toString())
      //console.log('Existing game IDs:', existingGameIds);

      // Filter games to keep (intersection of recent and existing)
      const gamesToKeep = recentlyPlayedGames.filter((game) =>
        existingGameIds.includes(game.gameId.toString())
      )
      //console.log(`Games to keep: ${gamesToKeep.length}`, gamesToKeep);

      if (gamesToKeep.length === 0) {
        console.log('No games to update. Skipping query execution for this user.')
        continue // Changed from 'return' to 'continue' to process other users
      }

      // Prepare query values
      const valuesPlaceholders = gamesToKeep
        .map(
          (_, index) =>
            `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
              index * 5 + 4
            }, $${index * 5 + 5})`
        )
        .join(', ')

      const values = gamesToKeep.flatMap((game) => [
        game.gameId,
        game.steamId,
        game.playtimeForever,
        game.playtime2Weeks,
        1,
      ])

      //console.log('Prepared values:', values);
      //console.log('Placeholders:', valuesPlaceholders);

      const query = `
        INSERT INTO "User_Games" ("game_id", "steam_id", "total_played", "last_2_weeks", "recency")
        VALUES ${valuesPlaceholders}
        ON CONFLICT ("game_id", "steam_id")
        DO UPDATE SET
          "total_played" = EXCLUDED."total_played",
          "last_2_weeks" = EXCLUDED."last_2_weeks",
          "recency" = EXCLUDED."recency";
      `

      //console.log('Executing query:', query);

      try {
        const result = await pool.query(query, values)
        //console.log(`Successfully updated ${result.rowCount} games for SteamID ${steamId}`);
      } catch (err) {
        await pool.query('UPDATE "Lockout" SET "code" = 0', [])
        console.error('Error updating User_Games:', err)
        console.error('Failed query:', query)
        console.error('Failed values:', values)
      }
    } catch (error) {
      await pool.query('UPDATE "Lockout" SET "code" = 0', [])
      console.error(`Error processing SteamID ${steamId}:`, error)
    }
  }
  //console.log('Finished processing all users');
}

export async function getFinalResults(steamId: bigint) {
  await pool.query('UPDATE "Lockout" SET "code" = 0', []) // we can finally release the lockout here

  const finalQuery = `
    WITH Friends AS (
      SELECT 
          CASE 
              WHEN user1 = $1 THEN user2
              ELSE user1
          END AS friend_steam_id
      FROM "User_Relations"
      WHERE user1 = $1 OR user2 = $1
    ),
    FriendProfiles AS (
        SELECT 
            f.friend_steam_id,
            p.username
        FROM Friends f
        JOIN "Profiles" p ON f.friend_steam_id = p.steam_id
    ),
    RecentGames AS (
        SELECT 
            ug.steam_id,
            ug.game_id,
            ug.last_2_weeks,
            ROW_NUMBER() OVER (PARTITION BY ug.steam_id ORDER BY ug.last_2_weeks DESC) AS game_rank
        FROM "User_Games" ug
        JOIN Friends f ON ug.steam_id = f.friend_steam_id
        WHERE ug.recency = 1
    )
    SELECT 
        fp.friend_steam_id,
        fp.username,
        COALESCE(rg.game_id, -1) AS game_id,
        COALESCE(rg.last_2_weeks, 0) AS last_2_weeks,
        g.name AS title
    FROM FriendProfiles fp
    LEFT JOIN RecentGames rg ON fp.friend_steam_id = rg.steam_id AND rg.game_rank <= 3
    LEFT JOIN "Games" g ON rg.game_id = g.game_id
    ORDER BY fp.friend_steam_id, COALESCE(rg.game_rank, 1);
  ` //big long query that gets all of the recently played games

  const finalResult = await pool.query(finalQuery, [steamId])
  //console.log('Final query result:', finalResult.rows);
  return finalResult.rows
}

export async function loadFriends(steamId: bigint, forced: boolean = false) {
  const mockReq = { steamId }
  const mockRes = {
    statusCode: 200,
    json: (data: any) => data,
    status: (code: number) => ({ json: (data: any) => data }),
  }

  try {
    await lockoutMiddleware(mockReq as any, mockRes as any, async () => {})

    console.log('Getting your friends list')
    const userIdsToCheck = await fetchAndProcessFriends(steamId, forced)

    console.log('Checking your friends out')
    await fetchAndStoreProfiles(userIdsToCheck)

    console.log('Creating relations')
    await updateUserRelations(steamId.toString(), userIdsToCheck)

    console.log('Looking at their games')
    await processAndStoreGames(userIdsToCheck)

    console.log('Cleaning up')
    const results = await getFinalResults(steamId)

    await releaseLockout(mockReq as any, mockRes as any, () => {})
    return results
  } catch (error) {
    await releaseLockout(mockReq as any, mockRes as any, () => {})
    console.error('Error in loadFriends:', error)

    throw error
  }
}

app.get('/themepreference', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId
  if (steamId) {
    try {
      const { rows } = await pool.query(
        'SELECT preference FROM "Profiles" WHERE steam_id = $1',
        [steamId]
      )
      return res.status(200).json(rows[0])
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    return res.status(401).json({ error: 'No steam id' })
  }
})

app.put('/themepreference', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId
  console.log('ThemeSteamId:' + steamId)
  const preference = req.body.preference
  if (steamId) {
    try {
      await pool.query('UPDATE "Profiles" SET preference = $1 WHERE steam_id = $2', [
        preference,
        steamId,
      ])
      return res.sendStatus(200)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    return res.status(401).json({ error: 'No steam id' })
  }
})

app.put('/hidegame', async (req, res) => {
  const steamId = req.query.steamid || req.session.steamId
  console.log('steamId:', steamId) // Debug log
  let hide = req.body.hide
  const gameId = req.body.gameId
  console.log('hide:', hide, 'gameId:', gameId)

  if (!steamId) {
    return res.status(401).json({ error: 'No Steam ID provided' })
  }

  if (hide !== 1 && hide !== 0) {
    return res.status(400).json({ error: 'Invalid hide value, must be 0 or 1' })
  }

  try {
    const result = await pool.query(
      'UPDATE "User_Games" SET hide = $1 WHERE steam_id = $2 AND game_id = $3',
      [hide, steamId, gameId]
    )

    console.log('Rows affected:', result.rowCount) // Debug log

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No matching game found for this user' })
    }

    return res.status(200).json({ success: true, message: 'Game visibility updated' })
  } catch (err) {
    console.error('Database error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/resyncHelper', async (req, res) => {
  const steamId = req.query.steamId || req.session.steamId

  if (!steamId) {
    return res.status(400).json({ error: 'steamId is required' })
  }

  try {
    const forced = req.query.forced === 'true'
    await loadFriends(steamId, forced)
    await insertGames(steamId)
    res.json({ success: true, message: 'Resync completed' })
  } catch (error) {
    console.error('Error in /resyncHelper:', error)
    res.status(500).json({ error: 'Failed to resync data' })
  }
})

app.get('/resyncHelper', async (req, res) => {
  const steamId = req.query.steamId || req.session.steamId

  if (!steamId) {
    return res.status(400).json({ error: 'steamId is required' })
  }

  try {
    const forced = req.query.forced === 'true'
    await loadFriends(steamId, forced)
    await insertGames(steamId)
    res.json({ success: true, message: 'Resync completed' })
  } catch (error) {
    console.error('Error in /resyncHelper:', error)
    res.status(500).json({ error: 'Failed to resync data' })
  }
})

export async function checkAccount(steamId) {
  let retVal = 0
  const KEY = process.env.STEAM_API_KEY

  const { rows: existingRows } = await pool.query(
    'SELECT * FROM "Profiles" WHERE "steam_id" = $1',
    [steamId]
  )

  if (existingRows.length > 0) {
    retVal = 3
    return retVal
  }

  console.log('made it here')
  try {
    // Checking game details
    const gameResponse = await axios.get(
      'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/',
      {
        params: {
          steamid: steamId,
          key: process.env.STEAM_API_KEY,
          format: 'json',
          include_appinfo: true,
          include_played_free_games: true,
        },
      }
    )

    for (let i = 0; i < 3; i++) {
      const iterationStart = Date.now()
      console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

      await sleep(i * 1000)

      const iterationEnd = Date.now()
      const iterationElapsed = (iterationEnd - iterationStart) / 1000
      console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
    }
    if (Object.keys(gameResponse.data.response).length > 0) {
      retVal += 2
    }

    // Checking friends list access
    const friendsResponse = await axios.get(
      'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/',
      {
        params: {
          steamid: steamId,
          relationship: 'friend',
          key: KEY,
        },
      }
    )

    const overallStart = Date.now()

    for (let i = 0; i < 3; i++) {
      const iterationStart = Date.now()
      console.log(`Starting iteration ${i} at ${new Date(iterationStart).toISOString()}`)

      await sleep(i * 1000)

      const iterationEnd = Date.now()
      const iterationElapsed = (iterationEnd - iterationStart) / 1000
      console.log(`Iteration ${i} completed in ${iterationElapsed.toFixed(2)} seconds`)
    }

    if (Object.keys(friendsResponse.data).length > 0) {
      retVal += 1
    }
  } catch (error) {
    console.error('Error fetching Steam API:', error.message)
  }
  /*
retVal:
 = 3 - account is all public and good to go
 = 2 - game details public, not friends list
 = 1 - friends list public, not game details
 = 0 - nothing public
*/
  return retVal
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
        <button onclick="window.location.href='${
          process.env.BACKEND_URL + '/auth/steam'
        }'"><strong>Try Again</strong></button>
      </body>
    </html>
  `
}

export default app
