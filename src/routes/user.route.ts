import { Hono } from 'hono'
import { register, login, updateProfile,getUsers  } from '../controllers/user.controller'
import type { D1Database } from '@cloudflare/workers-types'
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware'
type Bindings = {
  movie_db: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()
app.get('/users', getUsers)
app.post('/register', register)
app.post('/login', login)
app.put('/users', authMiddleware, updateProfile)

export const getMe = async (c: any) => {
  const user = c.get('user');

  const result = await c.env.movie_db.prepare(`
    SELECT id, username, display_name, avatar
    FROM users
    WHERE id = ?
  `).bind(user.userId).first();

  return c.json(result);
};

app.get('/me', authMiddleware, getMe)
export default app