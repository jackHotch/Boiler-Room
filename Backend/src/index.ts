import express from 'express'
import pg from 'pg'
import cors from 'cors'
import dotenv from 'dotenv'

const { Pool } = pg
dotenv.config()
const app = express()
const port = 8080
app.use(express.json())
app.use(cors())

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DB_URL,
})
pool.connect()

// Endpoints
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.get('/', (req, res) => {
  res.json({ message: 'hello' })
})

app.get('/test', (req, res) => {
  res.json({ message: 'this is a test from the backend' })
})

app.get('/supabase', async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM test`)
  res.send(rows[0].message)
})

app.get('/people', async(req, res) => {
  const { rows } = await pool.query(`SELECT * FROM userstest`);
  const peopleData = rows.map(row => row.people).join('\n');
  res.send(peopleData);
})

export default app