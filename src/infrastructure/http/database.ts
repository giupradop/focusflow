import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function getPool(): Promise<Pool> {
  return pool
}

export async function initDatabase(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS task (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(255) NOT NULL,
      category         VARCHAR(50)  NOT NULL,
      priority         VARCHAR(10)  NOT NULL,
      status           VARCHAR(20)  NOT NULL,
      createdat        TIMESTAMP    NOT NULL DEFAULT NOW(),
      duedate          TIMESTAMP    NOT NULL,
      estimatedminutes INT          NOT NULL,
      notes            TEXT         NOT NULL DEFAULT '',
      archived         BOOLEAN      NOT NULL DEFAULT FALSE,
      recurrent        BOOLEAN      NOT NULL DEFAULT FALSE,
      recurdays        VARCHAR(20)  NOT NULL DEFAULT '',
      recurpaused      BOOLEAN      NOT NULL DEFAULT FALSE,
      completedat      TIMESTAMP    NULL,
      spentseconds     INT          NOT NULL DEFAULT 0
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      id              SERIAL PRIMARY KEY,
      taskid          INT       NOT NULL REFERENCES task(id) ON DELETE CASCADE,
      startedat       TIMESTAMP NOT NULL,
      endedat         TIMESTAMP NULL,
      durationseconds INT       NOT NULL DEFAULT 0,
      pausedseconds   INT       NOT NULL DEFAULT 0
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leisurebank (
      id             INT NOT NULL PRIMARY KEY DEFAULT 1,
      balanceminutes INT NOT NULL DEFAULT 0,
      CONSTRAINT ck_leisurebank_singlerow CHECK (id = 1)
    )
  `)

  await pool.query(`
    INSERT INTO leisurebank (id, balanceminutes)
    SELECT 1, 0
    WHERE NOT EXISTS (SELECT 1 FROM leisurebank WHERE id = 1)
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leisureactivity (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      costminutes INT          NOT NULL,
      CONSTRAINT ck_leisureactivity_cost CHECK (costminutes > 0)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leisuresession (
      id                  SERIAL PRIMARY KEY,
      activityid          INT       NOT NULL REFERENCES leisureactivity(id),
      activitycostminutes INT       NOT NULL,
      startedat           TIMESTAMP NOT NULL,
      endedat             TIMESTAMP NULL,
      usedseconds         INT       NOT NULL DEFAULT 0
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS config (
      id    INT NOT NULL PRIMARY KEY DEFAULT 1,
      ratio INT NOT NULL DEFAULT 5,
      CONSTRAINT ck_config_singlerow CHECK (id = 1)
    )
  `)

  await pool.query(`
    INSERT INTO config (id, ratio)
    SELECT 1, 5
    WHERE NOT EXISTS (SELECT 1 FROM config WHERE id = 1)
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS focusday (
      date DATE PRIMARY KEY
    )
  `)

  console.log('banco inicializado')
}
