import { saveWatchHistory, getWatchHistory, deleteWatchHistory,
deleteAllWatchHistory } from '../services/history.service'

export const saveHistoryHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user || !user.userId) {
      return c.json({ success: false, message: "Unauthorized" }, 401)
    }

    const body = await c.req.json()

    await saveWatchHistory(c.env.movie_db, user.userId, body)

    return c.json({ success: true })

  } catch (err) {
    console.log("SAVE HISTORY ERROR:", err)
    return c.json({ success: false }, 500)
  }
}


export const getHistoryHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user) {
      return c.json({ success: false, message: "Unauthorized" }, 401)
    }

    const history = await getWatchHistory(
      c.env.movie_db,
      user.userId
    )

    return c.json({
      success: true,
      data: history
    })

  } catch (err) {
  console.log("GET HISTORY ERROR:", err)
  return c.json({
    success: false,
    error: err instanceof Error ? err.message : String(err)
  }, 500)
}
}

export const deleteHistoryHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user) {
      return c.json({
        success: false,
        message: "Unauthorized"
      }, 401)
    }

    const id = c.req.param('id')

    await deleteWatchHistory(
      c.env.movie_db,
      user.userId,
      id
    )

    return c.json({
      success: true,
      message: "History deleted"
    })

  } catch (err) {
    console.log("DELETE HISTORY ERROR:", err)

    return c.json({
      success: false
    }, 500)
  }
}

export const deleteAllHistoryHandler = async (c: any) => {
  try {
    const user = c.get('user')

    if (!user) {
      return c.json({
        success: false,
        message: "Unauthorized"
      }, 401)
    }

    await deleteAllWatchHistory(
      c.env.movie_db,
      user.userId
    )

    return c.json({
      success: true,
      message: "All history deleted"
    })

  } catch (err) {
    console.log("DELETE ALL HISTORY ERROR:", err)

    return c.json({
      success: false
    }, 500)
  }
}