-- Create favourites table for storing user favourite products
CREATE TABLE IF NOT EXISTS favourites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favourites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favourites_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Create index for faster queries
CREATE INDEX idx_favourites_user_id ON favourites(user_id);
CREATE INDEX idx_favourites_product_id ON favourites(product_id);
CREATE INDEX idx_favourites_created_at ON favourites(created_at);

-- Optional: Add some sample data for testing
-- INSERT INTO favourites (user_id, product_id) VALUES 
-- (1, 1), -- User 1 likes product 1
-- (1, 5), -- User 1 likes product 5
-- (2, 3); -- User 2 likes product 3
