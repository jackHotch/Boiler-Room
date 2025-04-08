import pg from 'pg'
import dotenv from 'dotenv'


export const { Pool } = pg
dotenv.config()

const pool = new Pool({
    connectionString: process.env.DB_URL,
  })
  pool.connect()

export async function manageLockout() {
  const selectResult = await pool.query('SELECT "code" FROM "Lockout"');
  const row = selectResult.rows[0];
  const currentStatus = row.code;

  if (currentStatus === 1) {
    return 'You are presently locked out, please try again later';
  } else if (currentStatus === 0) {
    console.log('Beginning API operation');
    await pool.query('UPDATE "Lockout" SET "code" = 1');
    return null;
  }
}

export async function lockoutMiddleware(req, res, next) {
  try {
    const lockoutMessage = await manageLockout();
    if (lockoutMessage) {
      return res.status(403).json({ error: lockoutMessage });
    }
    next();
  } catch (error) {
    console.error('Lockout middleware error:', error);
    res.status(500).json({ error: 'Internal server error during lockout check' });
  }
}

export async function releaseLockout(req, res, next) {
  try {
    await pool.query('UPDATE "Lockout" SET "code" = 0');
  } catch (error) {
    console.error('Error releasing lockout:', error);
  } finally {
    next();
  }
}