import { Hono } from 'hono'
import { saveHistoryHandler, getHistoryHandler } from '../controllers/history.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const app = new Hono()

app.post('/history', authMiddleware, saveHistoryHandler)
app.get('/history', authMiddleware, getHistoryHandler)

export default app