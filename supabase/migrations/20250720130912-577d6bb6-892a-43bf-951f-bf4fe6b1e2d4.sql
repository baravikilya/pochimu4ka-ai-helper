-- Create the pochimuchka schema
CREATE SCHEMA IF NOT EXISTS pochimuchka;

-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS pochimuchka.user_history_id_seq;
CREATE SEQUENCE IF NOT EXISTS pochimuchka.public_content_id_seq;

-- Create profiles table in pochimuchka schema
CREATE TABLE pochimuchka.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE pochimuchka.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON pochimuchka.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON pochimuchka.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON pochimuchka.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user_history table for private user data
CREATE TABLE pochimuchka.user_history (
  id BIGINT NOT NULL DEFAULT nextval('pochimuchka.user_history_id_seq'::regclass) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_history
ALTER TABLE pochimuchka.user_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user_history table
CREATE POLICY "Users can view their own history" 
ON pochimuchka.user_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own history" 
ON pochimuchka.user_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create public_content table for SEO-focused data
CREATE TABLE pochimuchka.public_content (
  id BIGINT NOT NULL DEFAULT nextval('pochimuchka.public_content_id_seq'::regclass) PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  question_title TEXT NOT NULL,
  answer_html TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on public_content
ALTER TABLE pochimuchka.public_content ENABLE ROW LEVEL SECURITY;

-- Create policies for public_content table
CREATE POLICY "Anyone can view public content" 
ON pochimuchka.public_content 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Only service_role can modify public content
CREATE POLICY "Only service role can modify public content" 
ON pochimuchka.public_content 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Create trigger function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION pochimuchka.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO pochimuchka.profiles (user_id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION pochimuchka.handle_new_user();