CREATE TABLE IF NOT EXISTS users(
    id                      INT AUTO_ INCREMENT PRIMARY KEY,
    email                   VARCHAR(255) UNIQUE NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,,
);