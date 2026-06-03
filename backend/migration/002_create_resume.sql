CREATE TABLE IF NOT EXISTS resumes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    resume_text  LONGTEXT NOT NULL,
    feedback     TEXT,
    user_id      INT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);