-- date_of_death is distinct from service_date (the funeral/visitation date)
-- and is one of the four fields the client specifically needs auto-filled
-- from scanned intake paperwork.
alter table documents add column if not exists date_of_death date;
