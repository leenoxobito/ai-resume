CREATE TABLE IF NOT EXISTS resume (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    resume_text  LOMGTEXT NOT NULL,
    feedback     TEXT,
    user_id      INT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);