import { insertGames, insertProfile, closeServer } from './index';
import axios from 'axios';
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

const testUserGames ={
  response: {
    game_count: 2,
    games: [
      {
        appid: 10,
        name: "Counter-Strike",
        playtime_forever: 0,
        img_icon_url: "6b0312cda02f5f777efa2f3318c307ff9acafbb5",
        content_descriptorids: [2, 5]
      },
      {
        appid: 80,
        name: "Counter-Strike: Condition Zero",
        playtime_forever: 0,
        img_icon_url: "077b050ef3e89cd84e2c5a575d78d53b54058236",
        content_descriptorids: [2, 5]
      }
    ]
  }
}


beforeAll(async () => {
  await pool.connect();
  await pool.query('DELETE FROM "Profiles" WHERE "steam_id" = $1', [testSteamId]);
});

afterAll(() => {
  closeServer()
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
  mockedAxios.get.mockResolvedValueOnce({
    data: testUserGames,
  });

  const result = await insertGames(BigInt(testSteamId));
  expect(result).toEqual({ success: true, message: 'Games inserted/updated successfully.' });

  const res = await pool.query('SELECT * FROM "User_Games" WHERE "steam_id" = $1', [testSteamId.toString()]);

  expect(res.rows[0].steam_id).toEqual(testSteamId.toString());
  expect(res.rows[0].game_id).toEqual(testUserGames.response.games[0].appid.toString());
  expect(res.rows[0].total_played).toEqual(testUserGames.response.games[0].playtime_forever.toString());
});
