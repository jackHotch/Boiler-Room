import request from 'supertest'
// import express from 'express'
import app from './index'

describe('Root Route', function () {
  test('Home route should work', async () => {
    const res = await request(app).get('/')
    expect(res.text).toEqual('hello')
  })
})