import { createComment } from '../services/comment.service'
import { getCommentsByMovie, buildCommentTree } from '../services/comment.service'

export const createCommentHandler = async (c: any) => {
  const user = c.get('user')
  const body = await c.req.json()

  const result = await createComment(c.env.movie_db, body, user.userId)

  return c.json({ success: true, result })
}


export const getCommentsHandler = async (c: any) => {
  const moviePath = c.req.param('path')

  const comments = await getCommentsByMovie(c.env.movie_db, moviePath)

  const tree = buildCommentTree(comments)

  return c.json(tree)
}
