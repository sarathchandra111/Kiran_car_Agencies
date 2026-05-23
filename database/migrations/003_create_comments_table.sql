-- Create Comments Table
CREATE TABLE comments (
  comment_id SERIAL PRIMARY KEY,
  job_card_id INT NOT NULL,
  advisor_id INT NOT NULL,
  comment_text TEXT NOT NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_card_id) REFERENCES job_cards(job_card_id) ON DELETE CASCADE,
  FOREIGN KEY (advisor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create Index for faster queries
CREATE INDEX idx_comments_job_card_id ON comments(job_card_id);
CREATE INDEX idx_comments_advisor_id ON comments(advisor_id);
CREATE INDEX idx_comments_created_date ON comments(created_date);
