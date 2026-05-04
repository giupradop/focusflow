import sql from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

const config: sql.config = {
  server: process.env.SQL_SERVER!,
  database: 'master',
  port: 1433,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.SQL_USER!,
      password: process.env.SQL_PASSWORD!,
    },
  },
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
}

let pool: sql.ConnectionPool | null = null

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config)
  }
  return pool
}

export async function initDatabase(): Promise<void> {
  const pool = await getPool()

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Task' AND xtype='U')
    CREATE TABLE Task (
      id               INT           IDENTITY(1,1) PRIMARY KEY,
      name             NVARCHAR(255) NOT NULL,
      category         NVARCHAR(50)  NOT NULL,
      priority         NVARCHAR(10)  NOT NULL,
      status           NVARCHAR(20)  NOT NULL,
      createdAt        DATETIME2     NOT NULL DEFAULT GETDATE(),
      dueDate          DATETIME2     NOT NULL,
      estimatedMinutes INT           NOT NULL,
      notes            NVARCHAR(MAX) NOT NULL DEFAULT '',
      archived         BIT           NOT NULL DEFAULT 0,
      recurrent        BIT           NOT NULL DEFAULT 0,
      recurDays        NVARCHAR(20)  NOT NULL DEFAULT '',
      recurPaused      BIT           NOT NULL DEFAULT 0,
      completedAt      DATETIME2     NULL,
      spentSeconds     INT           NOT NULL DEFAULT 0
    )
  `)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Session' AND xtype='U')
    CREATE TABLE Session (
      id              INT       IDENTITY(1,1) PRIMARY KEY,
      taskId          INT       NOT NULL REFERENCES Task(id) ON DELETE CASCADE,
      startedAt       DATETIME2 NOT NULL,
      endedAt         DATETIME2 NULL,
      durationSeconds INT       NOT NULL DEFAULT 0,
      pausedSeconds   INT       NOT NULL DEFAULT 0
    )
  `)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LeisureBank' AND xtype='U')
    BEGIN
      CREATE TABLE LeisureBank (
        id             INT NOT NULL PRIMARY KEY DEFAULT 1,
        balanceMinutes INT NOT NULL DEFAULT 0,
        CONSTRAINT CK_LeisureBank_SingleRow CHECK (id = 1)
      )
      INSERT INTO LeisureBank (id, balanceMinutes) VALUES (1, 0)
    END
  `)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LeisureActivity' AND xtype='U')
    CREATE TABLE LeisureActivity (
      id          INT           IDENTITY(1,1) PRIMARY KEY,
      name        NVARCHAR(255) NOT NULL,
      costMinutes INT           NOT NULL,
      CONSTRAINT CK_LeisureActivity_Cost CHECK (costMinutes > 0)
    )
  `)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LeisureSession' AND xtype='U')
    CREATE TABLE LeisureSession (
      id                  INT       IDENTITY(1,1) PRIMARY KEY,
      activityId          INT       NOT NULL REFERENCES LeisureActivity(id),
      activityCostMinutes INT       NOT NULL,
      startedAt           DATETIME2 NOT NULL,
      endedAt             DATETIME2 NULL,
      usedSeconds         INT       NOT NULL DEFAULT 0
    )
  `)

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Config' AND xtype='U')
    BEGIN
      CREATE TABLE Config (
        id    INT NOT NULL PRIMARY KEY DEFAULT 1,
        ratio INT NOT NULL DEFAULT 5,
        CONSTRAINT CK_Config_SingleRow CHECK (id = 1)
      )
      INSERT INTO Config (id, ratio) VALUES (1, 5)
    END
  `)

  console.log('banco inicializado')
}