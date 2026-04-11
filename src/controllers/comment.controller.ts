import { createComment } from '../services/comment.service'
import { getCommentsByMovie, buildCommentTree } from '../services/comment.service'

export const createCommentHandler = async (c: any) => {
  const user = c.get("user");
  const body = await c.req.json();

  const result = await createComment(
    c.env.movie_db,
    body,
    user.userId
  );

  const insertedId = result.meta?.last_row_id;

  if (!insertedId) {
    return c.json({ error: "Insert failed" }, 500);
  }

  // lấy comment vừa tạo
  const { results } = await c.env.movie_db.prepare(`
    SELECT c.*, u.display_name, u.avatar
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).bind(insertedId).all();

  const newComment = results[0];

  if (!newComment) {
    return c.json({ error: "Comment not found" }, 500);
  }

  newComment.replies = [];

  return c.json(newComment);
};


export const getCommentsHandler = async (c: any) => {
  const moviePath = c.req.param('path')

  const comments = await getCommentsByMovie(c.env.movie_db, moviePath)

  const tree = buildCommentTree(comments)

  return c.json(tree)
}
