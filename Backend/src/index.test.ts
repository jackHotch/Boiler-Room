import { insertGames, insertProfile, closeServer } from './index';
import axios from 'axios';
import { testGameDetails, testUserGames} from './TestingResponses';
import { Pool } from 'pg';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const testSteamId = "76561199154033472";
const testProfile = {
  response: {
    players: [
      {
        steamid: "76561199154033472",
        communityvisibilitystate: 3,
        profilestate: 1,
        personaname: "thorn1000",
        profileurl: "https://steamcommunity.com/profiles/76561199154033472/",
        avatar: "https://avatars.steamstatic.com/5538e220506aea324c1adfb5c53587625b2c939e.jpg",
        avatarmedium: "https://avatars.steamstatic.com/5538e220506aea324c1adfb5c53587625b2c939e_medium.jpg",
        avatarfull: "https://avatars.steamstatic.com/5538e220506aea324c1adfb5c53587625b2c939e_full.jpg",
        avatarhash: "5538e220506aea324c1adfb5c53587625b2c939e",
        lastlogoff: 1741812935,
        personastate: 1,
        primaryclanid: "103582791429521408",
        timecreated: 1616549496,
        personastateflags: 0
      }
    ]
  }
};

beforeAll(async () => {
  await pool.connect();
  await pool.query('DELETE FROM "Profiles" WHERE "steam_id" = $1', [testSteamId]);
});

afterAll(async () => {
  await pool.end();
  closeServer();
});

test('insertProfile inserts a profile and returns true', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: testProfile,
  });

  const result = await insertProfile(BigInt(testSteamId));
  expect(result).toBe(true);

  const res = await pool.query('SELECT * FROM "Profiles" WHERE "steam_id" = $1', [testSteamId]);
  expect(res.rows[0].steam_id).toEqual(testSteamId);
  expect(res.rows[0].username).toEqual(testProfile.response.players[0].personaname);
  expect(res.rows[0].avatar_hash).toEqual(testProfile.response.players[0].avatarhash);
});

test('insertGames inserts games and returns success message', async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: testGameDetails });

  const result = await insertGames(BigInt(testSteamId));
  expect(result).toEqual({ success: true, message: 'Games inserted/updated successfully.' });

  const res = await pool.query('SELECT * FROM "User_Games" WHERE "steam_id" = $1', [testSteamId.toString()]);
  expect(res.rows[0].steam_id).toEqual(testSteamId.toString());
  expect(res.rows[0].game_id).toEqual(testUserGames.game_id);
  expect(res.rows[0].total_played).toEqual(testUserGames.total_played);
  expect(res.rows[0].last_2_weeks).toEqual(testUserGames.last_2_weeks);
  expect(res.rows[0].recency).toEqual(testUserGames.recency);
});
