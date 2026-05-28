import { Hono } from 'hono'
import { saveHistoryHandler, getHistoryHandler,deleteHistoryHandler,
deleteAllHistoryHandler } from '../controllers/history.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const app = new Hono()

app.post('/history', authMiddleware, saveHistoryHandler)
app.get('/history', authMiddleware, getHistoryHandler)
app.delete(
  '/history/:id',
  authMiddleware,
  deleteHistoryHandler
)

app.delete(
  '/history',
  authMiddleware,
  deleteAllHistoryHandler
)
export default app