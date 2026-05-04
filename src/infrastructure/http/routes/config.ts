import { Router } from 'express'
import { getPool } from '../database'

export const configRoutes = Router()

configRoutes.get('/', async (_req, res) => {
  try {
    const pool = await getPool()
    const result = await pool.query(`SELECT ratio FROM config WHERE id = 1`)
    res.json({ ratio: result.rows[0].ratio })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

configRoutes.put('/', async (req, res) => {
  try {
    const { ratio } = req.body
    const pool = await getPool()
    await pool.query(`UPDATE config SET ratio = $1 WHERE id = 1`, [ratio])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})
