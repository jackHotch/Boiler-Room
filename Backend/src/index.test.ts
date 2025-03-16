import app, { insertGames, insertProfile, closeServer, checkAccount, hltbUpdate} from './index';
import axios from 'axios';

import { Pool } from 'pg';
import request from 'supertest';
import { testSteamId, testFriendsList, testRecentGames, testPlayerSummary, testGameDetails, supabaseTestSteamId } from './TestingResponses';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

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

afterAll(async () => {
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




describe('GET /steam/friendslist', () => {
  it('should return friends list', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: testFriendsList,
    });

    const response = await mockedAxios.get(`/steam/friendsList?steamid=${testSteamId}`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(testFriendsList);
    expect(response.data).toHaveLength(5);
  });

  it('should handle no steam id', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 400,
    });

    const response = await mockedAxios.get(`/steam/friendsList`);

    expect(response.status).toBe(400);
  });
});

describe('GET /steam/recentgames', () => {
  it('should return a list of games', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: testRecentGames,
    });

    const response = await mockedAxios.get(`/steam/recentgames?steamid=${testSteamId}`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(testRecentGames);
    expect(response.data).toHaveLength(3);
  })
}) 

describe('GET /steam/playersummary', () => {
  it('should return a username and image', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: testPlayerSummary,
    });

    const response = await mockedAxios.get(`/steam/playersummary?steamid=${testSteamId}`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual(testPlayerSummary);
  })

  it('should handle no steam id', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 400,
    });

    const response = await mockedAxios.get(`/steam/playersummary`);

    expect(response.status).toBe(400);
  });
}) 

describe('GET /games', () => {
  it('should return 3 random games from the database', async () => {
    const response = await request(app).get(`/games`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toHaveProperty('game_id')
    expect(response.body[0]).toHaveProperty('description')
    expect(response.body[0]).toHaveProperty('name')
    expect(response.body[0]).toHaveProperty('header_image')
    expect(response.body[0]).toHaveProperty('metacritic_score')
    expect(response.body[0]).toHaveProperty('hltb_score')
  })
}) 

describe('GET /games/:gameid', () => {
  it('should return game details for the gameid', async () => {
    const response = await request(app).get(`/games/10`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name')
    expect(response.body).toHaveProperty('header_image')
    expect(response.body).toHaveProperty('description')
    expect(response.body).toHaveProperty('hltb_score')
    expect(response.body).toHaveProperty('recommendations')
    expect(response.body).toHaveProperty('price')
    expect(response.body).toHaveProperty('metacritic_score')
    expect(response.body).toHaveProperty('released')
    expect(response.body).toHaveProperty('platform')
  })

  it('should return not a valid game id', async () => {
    const response = await request(app).get(`/games/counter-strike`);

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual('Invalid game ID format')
  })

  it('should return game not found', async () => {
    const response = await request(app).get(`/games/8`);

    expect(response.status).toBe(404);
    expect(response.body.error).toEqual('Game not found')
  })
}) 

describe('Check Account Visibility', () => {

  afterEach(() => {
      jest.clearAllMocks(); 
  });

  it('returns 3 when both game details and friends list are public', async () => {
      mockedAxios.get
          .mockResolvedValueOnce({ data: { response: { games: [{ appid: 123 }] } } }) 
          .mockResolvedValueOnce({ data: { friendslist: { friends: [{ steamid: '123' }] } } }); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(3);
  });

  it('returns 2 when only game details are public', async () => {
      mockedAxios.get
          .mockResolvedValueOnce({ data: { response: { games: [{ appid: 123 }] } } }) 
          .mockRejectedValueOnce({ data: { response: {} } }); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(2);
  });

  it('returns 1 when only friends list is public', async () => {
    mockedAxios.get
        .mockResolvedValueOnce({ data: { response: {} } }) 
        .mockResolvedValueOnce({ data: { friendslist: { friends: [{ steamid: '123' }] } } }); 

    const result = await checkAccount(testSteamId);
    expect(result).toBe(1);
  });

  it('returns 0 when both game details and friends list are private', async () => {
      mockedAxios.get
          .mockRejectedValueOnce({ data: { response: {} } }) 
          .mockRejectedValueOnce({ data: { response: {} } }); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(0);
  });

  it('handles API errors gracefully and returns 0', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API request failed')); 

      const result = await checkAccount(testSteamId);
      expect(result).toBe(0);
  });
});

describe('GET /themepreference', () => {
  it('should return the users theme preference', async () => {
    const response = await request(app).get(`/themepreference?steamid=${supabaseTestSteamId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({preference: 0})
  })

  it('should handle no steamid', async () => {
    const response = await request(app).get(`/themepreference`);

    expect(response.status).toBe(401);
  })
}) 

describe('PUT /themepreference', () => {
  it('should update the users theme preference to 1', async () => {
    const response = await request(app).put(`/themepreference?steamid=${supabaseTestSteamId}`).send({preference: 1});

    expect(response.status).toBe(200);
  })

  it('should update the users theme preference to 0', async () => {
    const response = await request(app).put(`/themepreference?steamid=${supabaseTestSteamId}`).send({preference: 0});

    expect(response.status).toBe(200);
  })

  it('should handle no steamid', async () => {
    const response = await request(app).put(`/themepreference`);

    expect(response.status).toBe(401);
  })
}) 


