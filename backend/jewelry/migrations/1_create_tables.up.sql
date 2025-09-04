CREATE TABLE memos (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  item_count INTEGER NOT NULL,
  item_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  paid INTEGER NOT NULL DEFAULT 0,
  due INTEGER NOT NULL DEFAULT 0,
  memo_image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memos_date ON memos(date DESC);
CREATE INDEX idx_memos_created_at ON memos(created_at DESC);
