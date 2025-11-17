-- enable uuid generation (if allowed)
create extension if not exists "pgcrypto";

-- USERS (customers and vendor owners)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text,
  email text,
  role text default 'customer', -- 'customer' | 'vendor' | 'admin'
  created_at timestamptz default now()
);

-- VENDORS
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references users(id) on delete set null,
  name text not null,
  type text, -- e.g., 'grocery', 'restaurant'
  address text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- CATEGORIES
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- ITEMS (products)
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendors(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  bulk boolean default false,
  stock integer default 0,
  image_url text,
  created_at timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  total numeric(12,2) default 0,
  status text default 'pending', -- pending|accepted|preparing|dispatched|delivered|cancelled
  charge_method text default 'cash', -- cash|manual|razorpay|stripe later
  address text,
  contact_phone text,
  created_at timestamptz default now()
);

-- ORDER ITEMS (line items)
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  item_id uuid references items(id) on delete set null,
  qty integer default 1,
  price numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_items_vendor on items(vendor_id);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_vendors_type on vendors(type);

-- Optional: seed minimal data
insert into categories (name) values ('Vegetables') on conflict do nothing;
insert into categories (name) values ('Grocery') on conflict do nothing;
insert into categories (name) values ('Restaurant') on conflict do nothing;
insert into vendors (name, type, address, lat, lng)
values ('Demo Vendor','grocery','Mumbai',19.07,72.87) on conflict do nothing;

-- Add parent_id to categories
alter table categories
add column parent_id uuid references categories(id) on delete set null;

-- Create addresses table
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  label text,
  line1 text,
  line2 text,
  city text,
  state text,
  pincode text,
  lat double precision,
  lng double precision,
  phone text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Add order fields
alter table orders
add column delivery_address_id uuid references addresses(id) on delete set null,
add column delivery_address_snapshot jsonb,
add column instructions text;
