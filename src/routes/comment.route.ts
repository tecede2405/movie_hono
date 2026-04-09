import { Hono } from 'hono'
import { createCommentHandler, getCommentsHandler } from '../controllers/comment.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const app = new Hono()

app.get('/comments/:path', getCommentsHandler)
app.post('/comments', authMiddleware, createCommentHandler)

export default app