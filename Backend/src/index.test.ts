import request from 'supertest';
import app, { checkAccount, closeServer } from './index';
import axios from 'axios';
import { testSteamId, testFriendsList, testRecentGames, testPlayerSummary, testGameDetails } from './TestingResponses';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

afterAll(() => {
  closeServer()
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
    expect(response.body).toEqual(testGameDetails)
  })
}) 

describe('checkAccount function', () => {

  afterEach(() => {
      jest.clearAllMocks(); // Clear mocks after each test
  });

  test('returns 3 when both game details and friends list are public', async () => {
      mockedAxios.get
          .mockResolvedValueOnce({ data: { response: { games: [{ appid: 730 }] } } }) // Mock game details API
          .mockResolvedValueOnce({ data: { friendslist: { friends: [{ steamid: '123' }] } } }); // Mock friends list API

      const result = await checkAccount(testSteamId);
      expect(result).toBe(3);
  });

  test('returns 2 when only game details are public', async () => {
      mockedAxios.get
          .mockResolvedValueOnce({ data: { response: { games: [{ appid: 730 }] } } }) // Mock game details API
          .mockRejectedValueOnce(new Error('Friends list is private')); // Mock friends list API failure

      const result = await checkAccount(testSteamId);
      expect(result).toBe(2);
  });

  // test('returns 1 when only friends list is public', async () => {
  //   mockedAxios.get
  //       .mockRejectedValueOnce(new Error('Game details are private')) // Mock game details API failure
  //       .mockResolvedValueOnce({ data: { friendslist: { friends: [{ steamid: '123' }] } } }); // Correctly structured response

  //   const result = await checkAccount(testSteamId);
  //   expect(result).toBe(1);
  // });

  // test('returns 0 when both game details and friends list are private', async () => {
  //     mockedAxios.get
  //         .mockRejectedValueOnce(new Error('Game details are private')) // Mock game details API failure
  //         .mockRejectedValueOnce(new Error('Friends list is private')); // Mock friends list API failure

  //     const result = await checkAccount(testSteamId);
  //     expect(result).toBe(0);
  // });

  // test('handles API errors gracefully and returns 0', async () => {
  //     mockedAxios.get.mockRejectedValue(new Error('API request failed')); // Mock both requests failing

  //     const result = await checkAccount(testSteamId);
  //     expect(result).toBe(0);
  // });
});