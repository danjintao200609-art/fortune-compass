-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles
-- Stores user configuration and preferences
create table public.profiles (
  id uuid references auth.users not null primary key,
  nickname text,
  birthday date,
  gender text check (gender in ('male', 'female')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Table: fortune_history
-- Stores the history of generated fortunes
create table public.fortune_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users, -- can be null for anonymous users if we allow that, or we can use a session_id
  fortunetype text not null, -- 'fengshui' or 'horoscope'
  game_type text, -- 'mahjong', 'poker', 'guandan'
  prediction_date date not null,
  
  -- Result fields
  direction text,
  summary text,
  lucky_color text,
  best_time text,
  energy_value text,
  lucky_numbers jsonb, -- Storing array as jsonb
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for fortune_history
alter table public.fortune_history enable row level security;

create policy "Users can view their own fortune history."
  on fortune_history for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own fortune history."
  on fortune_history for insert
  with check ( auth.uid() = user_id );

-- Optional: If we want to allow anonymous inserts (no auth) we might need different policies or a service role key on backend.
-- Since we are building a backend, the backend can use SERVICE_ROLE_KEY to bypass RLS if needed, 
-- or we can implement Auth on the frontend.
-- For now, let's assume the backend will handle the insertion using the Service Role or the user's JWT.
