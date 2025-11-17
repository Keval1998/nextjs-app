-- db/seed/seed_vendors.sql
insert into vendors (name)
values
  ('Test Vendor - Subapas'),
  ('Demo Vendor')
on conflict do nothing;
