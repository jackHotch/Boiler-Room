import request from 'supertest';
import { app, closeServer } from './index'; // Import Express app & server
import { testSteamId, testFriendsList } from './TestingResponses';

afterAll(() => {
  closeServer()
});

describe('GET /steam/friendslist', () => {
  it('should return friends list', async () => {
    const response = await request(app).get(`/steam/friendsList?steamid=${testSteamId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(testFriendsList)
    expect(response.body).toHaveLength(290);
  });

  it('should handle no steam id', async () => {
    const response = await request(app).get(`/steam/friendsList`);

    expect(response.status).toBe(401);
  });
});
