
import request from 'supertest';
import { server } from './index'; // Import the running server

// Mock response data
const mockResponse = {
    "friendslist": {
        "friends": [
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
                "steamid": "76561198850310631",
                "relationship": "friend",
                "friend_since": 1690937295
            }
        ]
    }
};

test('fetches friends list from API', async () => {
    const response = await request(server).get('http://localhost:8080/steam/friendsList').query({ steamid: '76561198319837768' });;

    // expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
    // expect(response.body.friendslist.friends).toHaveLength(4);
});

