-- Tạo bảng mới (schema mới của bạn)
CREATE TABLE movies_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image TEXT,
  thumb TEXT,
  video TEXT,
  path TEXT,
  episode_current TEXT,
  content TEXT,
  lang TEXT,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data cũ
INSERT INTO movies_new
SELECT id, title, image, thumb, video, path, episode_current, content, lang, category, order_index, created_at
FROM movies;

-- Xóa bảng cũ
DROP TABLE movies;

-- Đổi tên
ALTER TABLE movies_new RENAME TO movies;