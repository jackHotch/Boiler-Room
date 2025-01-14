import express from 'express'
import cors from 'cors'
const app = express()
const port = 8080

app.use(express.json())
app.use(cors())

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.get('/', (req, res) => {
  res.json({ message: 'hello' })
})

app.get('/test', (req, res) => {
  res.json({ message: 'this is a test from the backend' })
})

export default app