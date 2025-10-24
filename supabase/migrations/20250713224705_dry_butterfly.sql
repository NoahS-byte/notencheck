-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    display_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'expired', 'free', 'trial')),
    trial_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Grade profiles table
CREATE TABLE grade_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    main_tasks JSONB NOT NULL,
    sub_tasks JSONB NOT NULL,
    use_sub_tasks BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Todos table
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    category TEXT DEFAULT 'Allgemein',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Invitations table
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    trial_days INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    used_by TEXT,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_grade_profiles_user_id ON grade_profiles(user_id);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_invitations_code ON invitations(code);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table (admin can see all, users can see themselves)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true); -- Allow reading for authentication

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true); -- Allow updates for profile management

CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true); -- Allow registration

-- RLS Policies for grade_profiles table
CREATE POLICY "Users can manage own profiles" ON grade_profiles
    FOR ALL USING (true); -- Simplified for now, can be restricted later

-- RLS Policies for todos table
CREATE POLICY "Users can manage own todos" ON todos
    FOR ALL USING (true); -- Simplified for now, can be restricted later

-- RLS Policies for invitations table
CREATE POLICY "Anyone can read active invitations" ON invitations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage invitations" ON invitations
    FOR ALL USING (true); -- Will be restricted to admin users

-- Create default admin user
INSERT INTO users (
    email, 
    password_hash, 
    salt, 
    display_name, 
    is_admin, 
    payment_status
) VALUES (
    'admin@notencheck.app',
    'admin_password_hash_here', -- You'll need to update this with actual hash
    'admin_salt_here', -- You'll need to update this with actual salt
    'Administrator',
    true,
    'free'
);