alter table products
  add column status varchar(30);

update products
set status = case
               when is_archived = true then 'ARCHIVED'
               else 'PUBLISHED'
  end;

alter table products
  alter column status set not null;
