import {
  addFavorite,
  getFavorites,
  deleteFavorite,
  checkFavorite
} from '../services/favorite.service'

export const addFavoriteHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user || !user.userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const body = await c.req.json()

    if (!body.movie_path) {
      return c.json({ success: false, message: 'movie_path is required' }, 400)
    }

    await addFavorite(c.env.movie_db, user.userId, body)

    return c.json({ success: true, message: 'Added to favorites' })
  } catch (err) {
    console.log('ADD FAVORITE ERROR:', err)
    return c.json({ success: false }, 500)
  }
}

export const getFavoritesHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user || !user.userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const favorites = await getFavorites(c.env.movie_db, user.userId)

    return c.json({ success: true, data: favorites })
  } catch (err) {
    console.log('GET FAVORITES ERROR:', err)
    return c.json({
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }, 500)
  }
}

export const deleteFavoriteHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user || !user.userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const moviePath = c.req.param('movie_path')

    await deleteFavorite(c.env.movie_db, user.userId, moviePath)

    return c.json({ success: true, message: 'Removed from favorites' })
  } catch (err) {
    console.log('DELETE FAVORITE ERROR:', err)
    return c.json({ success: false }, 500)
  }
}

export const checkFavoriteHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user || !user.userId) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const moviePath = c.req.param('movie_path')

    const isFavorited = await checkFavorite(c.env.movie_db, user.userId, moviePath)

    return c.json({ success: true, isFavorited })
  } catch (err) {
    console.log('CHECK FAVORITE ERROR:', err)
    return c.json({ success: false }, 500)
  }
}
