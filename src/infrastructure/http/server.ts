import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './database'
import { taskRoutes } from './routes/tasks'
import { leisureRoutes } from './routes/leisure'
import { configRoutes } from './routes/config'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  const key = req.headers['x-api-key']
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'não autorizado' })
  }
  next()
})

app.use('/api/tasks', taskRoutes)
app.use('/api/leisure', leisureRoutes)
app.use('/api/config', configRoutes)

const PORT = process.env.PORT ?? 3001

async function start() {
  try {
    console.log('conectando ao banco...')
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`servidor rodando em http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('erro ao iniciar:', err)
    process.exit(1)
  }
}

start()