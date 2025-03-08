import axios from 'axios';
import { testSteamId, testFriendsList, testRecentGames } from './TestingResponses';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
      status: 401,
    });

    const response = await mockedAxios.get(`/steam/friendsList`);

    expect(response.status).toBe(401);
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
