import { saveWatchHistory, getWatchHistory } from '../services/history.service'

export const saveHistoryHandler = async (c: any) => {
  const user = c.get('user')
  const body = await c.req.json()

  const result = await saveWatchHistory(
    c.env.movie_db,
    user.userId,
    body
  )

  return c.json({ success: true, result })
}


export const getHistoryHandler = async (c: any) => {
  const user = c.get('user')

  const history = await getWatchHistory(
    c.env.movie_db,
    user.userId
  )

  return c.json(history)
}