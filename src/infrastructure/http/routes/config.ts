import { Router } from 'express'
import { getPool } from '../database'
import sql from 'mssql'

export const configRoutes = Router()

configRoutes.get('/', async (req, res) => {
  try {
    const pool = await getPool()
    const result = await pool.request()
      .query(`SELECT ratio FROM Config WHERE id = 1`)
    res.json({ ratio: result.recordset[0].ratio })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

configRoutes.put('/', async (req, res) => {
  try {
    const { ratio } = req.body
    const pool = await getPool()
    await pool.request()
      .input('ratio', sql.Int, ratio)
      .query(`UPDATE Config SET ratio = @ratio WHERE id = 1`)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})