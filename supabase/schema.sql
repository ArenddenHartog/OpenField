-- ============================================================
-- OpenField – Supabase schema
-- Run this in the Supabase SQL editor (Database → SQL Editor)
-- ============================================================

-- ── Solutions ────────────────────────────────────────────────

create table if not exists solutions (
  id              text primary key,
  user_id         uuid references auth.users(id) on delete set null,
  created_at      timestamptz default now(),
  name            text not null,
  type            text,
  image_url       text,
  proposition     text,
  stage           text,
  challenge_ids   text[] default '{}',
  contexts        text[] default '{}',
  crops           text[] default '{}',
  required_systems text[] default '{}',
  required_data   text[] default '{}',
  geography       text[] default '{}',
  looking_for     text[] default '{}',
  website         text,
  contact_email   text,
  pricing_model   text
);

alter table solutions enable row level security;
create policy "solutions_read"   on solutions for select using (true);
create policy "solutions_insert" on solutions for insert with check (true);
create policy "solutions_update" on solutions for update using (auth.uid() = user_id);
create policy "solutions_delete" on solutions for delete using (auth.uid() = user_id);

-- ── Pilot offers ─────────────────────────────────────────────

create table if not exists pilot_offers (
  id               text primary key,
  solution_id      text references solutions(id) on delete cascade,
  title            text,
  type             text,
  status           text default 'Open',
  availability     text,
  duration         text,
  includes         text[] default '{}',
  response_time    text,
  required_context text[] default '{}',
  required_systems text[] default '{}',
  required_data    text[] default '{}'
);

alter table pilot_offers enable row level security;
create policy "pilot_offers_read"   on pilot_offers for select using (true);
create policy "pilot_offers_insert" on pilot_offers for insert with check (true);
create policy "pilot_offers_update" on pilot_offers for update using (
  exists (select 1 from solutions where id = solution_id and user_id = auth.uid())
);
create policy "pilot_offers_delete" on pilot_offers for delete using (
  exists (select 1 from solutions where id = solution_id and user_id = auth.uid())
);

-- ── Evidence records ──────────────────────────────────────────

create table if not exists evidence_records (
  id          text primary key,
  solution_id text references solutions(id) on delete cascade,
  type        text,
  tested      text,
  geography   text,
  impact      text,
  quality     text
);

alter table evidence_records enable row level security;
create policy "evidence_read"   on evidence_records for select using (true);
create policy "evidence_insert" on evidence_records for insert with check (true);
create policy "evidence_update" on evidence_records for update using (
  exists (select 1 from solutions where id = solution_id and user_id = auth.uid())
);
create policy "evidence_delete" on evidence_records for delete using (
  exists (select 1 from solutions where id = solution_id and user_id = auth.uid())
);

-- ── Grower profiles ───────────────────────────────────────────

create table if not exists grower_profiles (
  id                    text primary key,
  user_id               uuid references auth.users(id) on delete cascade unique,
  created_at            timestamptz default now(),
  name                  text,
  role                  text,
  image_url             text,
  region                text,
  countries             text[] default '{}',
  operation             text,
  operation_scale       text,
  contexts              text[] default '{}',
  crops                 text[] default '{}',
  openness              text,
  challenge_ids         text[] default '{}',
  constraints           text[] default '{}',
  systems               text[] default '{}',
  available_data        text[] default '{}',
  pilot_types           text[] default '{}',
  website               text,
  contact_email         text,
  certifications        text[] default '{}',
  preferred_pilot_season text
);

alter table grower_profiles enable row level security;
create policy "profiles_read"   on grower_profiles for select using (true);
create policy "profiles_insert" on grower_profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on grower_profiles for update using (auth.uid() = user_id);
create policy "profiles_delete" on grower_profiles for delete using (auth.uid() = user_id);

-- ── Intro requests ────────────────────────────────────────────

create table if not exists intro_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  solution_id     text references solutions(id),
  requester_name  text,
  requester_email text,
  message         text,
  status          text default 'pending'
);

alter table intro_requests enable row level security;
create policy "intro_requests_insert" on intro_requests for insert with check (true);
create policy "intro_requests_read"   on intro_requests for select using (
  exists (select 1 from solutions where id = solution_id and user_id = auth.uid())
);

-- ============================================================
-- Storage bucket
-- Create this in Supabase Dashboard → Storage → New bucket:
--   Name: openfield-images
--   Public: true
-- Then add this policy:
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('openfield-images', 'openfield-images', true)
-- on conflict do nothing;

-- create policy "images_upload" on storage.objects
--   for insert with check (bucket_id = 'openfield-images');
-- create policy "images_read" on storage.objects
--   for select using (bucket_id = 'openfield-images');

-- ============================================================
-- Seed data  (run after schema)
-- ============================================================

insert into solutions (id, name, type, proposition, stage, challenge_ids, contexts, crops, required_systems, required_data, geography, looking_for) values
(
  'sol-sporesight-ai', 'SporeSight AI', 'AI / Software',
  'Early mildew and fungal disease detection from greenhouse imagery.',
  'Active pilots',
  ARRAY['disease-detection','crop-scouting','pesticide-reduction'],
  ARRAY['Greenhouse','High-value crops'],
  ARRAY['Tomato','Cucumber','Sweet pepper'],
  ARRAY['Stable internet','Scouting rounds','Basic sensor setup'],
  ARRAY['Weekly image capture','Disease observations'],
  ARRAY['NL','BE'],
  ARRAY['Pilot growers','Agronomic feedback','Data partners']
),
(
  'sol-bioshield-labs', 'BioShield Labs', 'Biological / Biostimulants',
  'Beneficial microbe treatment to suppress soil-borne pathogens.',
  'First field test',
  ARRAY['biological-control','pesticide-reduction','resistance-management'],
  ARRAY['Open field','Nursery','Organic systems'],
  ARRAY['Strawberry','Tree nursery','Lettuce','Ornamental trees','Shrubs'],
  ARRAY['Manual scouting'],
  ARRAY['Soil samples','Control plot','Disease observations'],
  ARRAY['NL'],
  ARRAY['Trial locations','Research partner','Grower feedback']
),
(
  'sol-spraywise-robotics', 'SprayWise Robotics', 'Precision machinery',
  'Spot-spraying module that reduces chemical use through plant-level targeting.',
  'Proven in production',
  ARRAY['precision-spraying','pesticide-reduction','crop-scouting'],
  ARRAY['Open field','Orchard','Nursery'],
  ARRAY['Potato','Onion','Apple','Pear','Tree nursery','Ornamental trees','Shrubs'],
  ARRAY['Sprayer','GPS guidance','Field maps'],
  ARRAY['Field boundary data'],
  ARRAY['NL','DE','DK'],
  ARRAY['Launch customers','Distribution partners']
)
on conflict (id) do nothing;

insert into pilot_offers (id, solution_id, title, type, status, availability, duration, includes, response_time, required_context, required_systems, required_data) values
(
  'pilot-sporesight-2027', 'sol-sporesight-ai',
  'Greenhouse disease detection pilot', 'Paid pilot', 'Open',
  'Looking for 3 pilot locations for next season', '10–12 weeks',
  ARRAY['Camera kit (loan)','Platform access','Weekly agronomic review'],
  'Reply within 3 working days',
  ARRAY['Greenhouse'], ARRAY['Stable internet','Scouting rounds'],
  ARRAY['Weekly image capture','Disease observations']
),
(
  'pilot-bioshield-field-trial', 'sol-bioshield-labs',
  'Biological control commercial-scale trial', 'Free pilot', 'Open',
  'Open for first commercial-scale trials', '8–12 weeks',
  ARRAY['Product supply','Application guidance','Trial design support','End-of-season report'],
  'Reply within 5 working days',
  ARRAY['Open field','Nursery','Organic systems'], ARRAY['Manual scouting'],
  ARRAY['Soil samples','Control plot','Disease observations']
),
(
  'pilot-spraywise-new-crops', 'sol-spraywise-robotics',
  'Precision spraying pilots for new crops', 'Paid pilot', 'Open',
  'Commercial rollout; pilots for new crops', 'One spraying season',
  ARRAY['Sprayer module installation','Operator training','Field data analysis'],
  'Reply within 2 working days',
  ARRAY['Open field','Orchard','Nursery'], ARRAY['Sprayer','GPS guidance','Field maps'],
  ARRAY['Field boundary data']
)
on conflict (id) do nothing;

insert into evidence_records (id, solution_id, type, tested, geography, impact, quality) values
('evidence-sporesight-greenhouse', 'sol-sporesight-ai', 'Active pilots', '6 greenhouse pilots', 'NL, BE', 'Earlier disease alerts; pesticide applications reduced in selected test blocks', 'Medium'),
('evidence-bioshield-plot', 'sol-bioshield-labs', 'Plot trial', 'Lab + 2 small plot trials', 'NL', 'Promising suppression of root disease pressure', 'Early'),
('evidence-spraywise-production', 'sol-spraywise-robotics', 'Production use', '25+ production farms', 'NL, DE, DK', 'Chemical use reduction in targeted applications', 'High')
on conflict (id) do nothing;
