import request from "supertest";
import express from "express";

const app = express();
let server;

beforeAll(() => {
  app.get("/jest", (req, res) => {
    res.send("hello");
  });
  server = app.listen(8000);
});

afterAll(() => {
  server.close();
});

describe("Root Route", function () {
  test("Home route should work", async () => {
    const res = await request(app).get("/jest");
    expect(res.text).toEqual("hello");
  });
});
