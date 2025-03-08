import request from 'supertest';
import { app, server } from './index'; // Import Express app & server

// Mock data
const mockResponse = [
          {
              "steamid": "76561198319837768",
              "relationship": "friend",
              "friend_since": 1690937277
          },
          {
              "steamid": "76561198350287949",
              "relationship": "friend",
              "friend_since": 1689991413
          },
          {
              "steamid": "76561198800054092",
              "relationship": "friend",
              "friend_since": 1710635975
          },
          {
              "steamid": "76561198804671423",
              "relationship": "friend",
              "friend_since": 1741203620
          },
          {
              "steamid": "76561198850310631",
              "relationship": "friend",
              "friend_since": 1690937295
          }
      ]

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
  app.closeServer();
});

describe('GET /steam/friendslist', () => {

  it('should return friends list', async () => {
    const steamId = "76561199509790498"

    const response = await request(app).get(`/steam/friendsList?steamid=${steamId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
    expect(response.body).toHaveLength(5);
  });
});
