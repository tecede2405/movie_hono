export const saveWatchHistory = async (db: any, userId: number, body: any) => {
  // 1. insert hoặc update
  await db.prepare(`
    INSERT INTO watch_history (user_id, movie_path, episode)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, movie_path)
    DO UPDATE SET
      episode = excluded.episode,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    userId,
    body.movie_path,
    body.episode
  ).run()

  // 2. giữ tối đa 15 phim
  await db.prepare(`
    DELETE FROM watch_history
    WHERE id NOT IN (
      SELECT id FROM watch_history
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 15
    )
    AND user_id = ?
  `).bind(userId, userId).run()
}


export const getWatchHistory = async (db: any, userId: number) => {
  const { results } = await db.prepare(`
    SELECT h.*, m.title, m.image, m.thumb
    FROM watch_history h
    LEFT JOIN movies m ON h.movie_path = m.path
    WHERE h.user_id = ?
    ORDER BY h.updated_at DESC
  `).bind(userId).all()

  return results
}