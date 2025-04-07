// Create our pg mocks
const mockQuery = jest.fn();
const mockConnect = jest.fn();

// Mock the pg module before any imports that use it.
jest.mock("pg", () => ({
  Pool: jest.fn(() => ({
    query: mockQuery,
    connect: mockConnect,
  })),
}));

import { Pool, QueryResult } from "pg";
import request from "supertest";
import app from "./index"; // Import the app, not the server
import axios from "axios";
import cors from "cors";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Test suite for GET /gamesByFilter
describe("GET /gamesByFilter", () => {
  it("returns filtered game recommendations", async () => {
    // Mock axios GET response
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        rows: [
          {
            name: "Portal 2",
            header_image: "img.png",
            description: "A game",
            boil_score: 9,
            released: "2011-04-19",
          },
        ],
      },
    });

    // Mock pg query result
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          name: "Portal 2",
          header_image: "img.png",
          description: "A game",
          boil_score: 9,
          released: "2011-04-19",
        },
      ],
    });

    // Send request with query parameters
    const response = await request(app)
      .get("/gamesByFilter")
      .query({
        minBoilRating: 8,
        minYear: "2000-01-01",
        maxYear: "2025-01-01",
        platform: [4],
        genre: ["Action"],
        maxHLTB: 20,
        steamId: "12345",
      });

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name).toBe("Portal 2");
  });
});

// Test suite for GET /userGameSpecs
describe("GET /userGameSpecs", () => {
  it("returns user stats", async () => {
    // Mock the pg query result
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          most_common_genre: "Action",
          genre_count: 5,
          most_common_platform: 4,
          avg_hltb: 10,
        },
      ],
    });

    // Also mock connect() to return an object with a release() method.
    mockConnect.mockResolvedValueOnce({
      release: jest.fn(),
    });

    // Send request to /userGameSpecs endpoint
    const response = await request(app)
      .get("/userGameSpecs")
      .query({ steamid: "123456" });

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body[0].most_common_genre).toBe("Action");
  });
});
