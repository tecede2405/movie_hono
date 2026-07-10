import { Hono } from 'hono'
import {
  addFavoriteHandler,
  getFavoritesHandler,
  deleteFavoriteHandler,
  checkFavoriteHandler
} from '../controllers/favorite.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const app = new Hono()

// Thêm phim vào yêu thích
app.post('/favorites', authMiddleware, addFavoriteHandler)

// Lấy danh sách phim yêu thích
app.get('/favorites', authMiddleware, getFavoritesHandler)

// Kiểm tra xem phim có trong yêu thích không
app.get('/favorites/:movie_path', authMiddleware, checkFavoriteHandler)

// Xóa phim khỏi yêu thích
app.delete('/favorites/:movie_path', authMiddleware, deleteFavoriteHandler)

export default app
