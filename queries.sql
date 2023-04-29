-- CREATE DATABASE shopping_list;
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO shopping_list;
-- GRANT ALL ON SCHEMA public TO public;

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reset_token TEXT,
    reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- Create shopping_lists table
CREATE TABLE shopping_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (length(name) >= 1) UNIQUE,
    owner_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (owner_id) REFERENCES users (id)
);

-- Create items table
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (length(name) >= 1),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    checked BOOLEAN DEFAULT false,
    shopping_list_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id)
);

-- Create shared_shopping_lists table
CREATE TYPE shared_shopping_list_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE shared_shopping_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shopping_list_id UUID NOT NULL,
    sharing_user_id UUID NOT NULL,
    receiving_user_id UUID NOT NULL,
    status shared_shopping_list_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (sharing_user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (receiving_user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add indices
CREATE INDEX idx_item_shopping_list_id ON items (shopping_list_id);
CREATE INDEX idx_shopping_list_owner_id ON shopping_lists (owner_id);
CREATE INDEX idx_shared_shopping_list_shopping_list_id ON shared_shopping_lists (shopping_list_id);
CREATE INDEX idx_shared_shopping_list_sharing_user_id ON shared_shopping_lists (sharing_user_id);
CREATE INDEX idx_shared_shopping_list_receiving_user_id ON shared_shopping_lists (receiving_user_id);

-- Add triggers to update the `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_item_updated_at BEFORE
UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_lists_updated_at BEFORE
UPDATE ON shopping_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shared_shopping_list_updated_at BEFORE
UPDATE ON shared_shopping_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();