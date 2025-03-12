import { insertGames, insertProfile, closeServer } from './index';
import axios from 'axios';
import { testSteamId, testGameDetails, testUserGames, testProfile } from './TestingResponses';
import { Pool } from 'pg';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

beforeAll(async () => {
  await pool.connect();
  await pool.query('DELETE FROM "Profile" WHERE steam_id = $1', [testSteamId.toString()]);
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

  const res = await pool.query('SELECT * FROM "Profile" WHERE steam_id = $1', [testSteamId.toString()]);
  expect(res.rows[0].steam_id).toEqual(testSteamId.toString());
  expect(res.rows[0].username).toEqual(testProfile.username);
  expect(res.rows[0].avatar_hash).toEqual(testProfile.avatar_hash);
  expect(res.rows[0].preference).toEqual(testProfile.preference);
});

test('insertGames inserts games and returns success message', async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: testGameDetails });

  const result = await insertGames(BigInt(testSteamId));
  expect(result).toEqual({ success: true, message: 'Games inserted/updated successfully.' });

  const res = await pool.query('SELECT * FROM "User_Games" WHERE steam_id = $1', [testSteamId.toString()]);
  expect(res.rows[0].steam_id).toEqual(testSteamId.toString());
  expect(res.rows[0].game_id).toEqual(testUserGames.game_id);
  expect(res.rows[0].total_played).toEqual(testUserGames.total_played);
  expect(res.rows[0].last_2_weeks).toEqual(testUserGames.last_2_weeks);
  expect(res.rows[0].recency).toEqual(testUserGames.recency);
});