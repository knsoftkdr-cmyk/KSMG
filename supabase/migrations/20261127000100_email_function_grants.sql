-- The send-email Edge Function reads these tables with the service_role key.
-- service_role bypasses RLS, but it still needs table privileges, which this
-- project does not give it by default ("permission denied for table enquiries").

grant usage on schema public to service_role;

grant select on public.enquiries      to service_role;
grant select on public.profiles       to service_role;
grant select on public.quote_versions to service_role;
grant select on public.samples        to service_role;
grant select on public.dispatches     to service_role;
grant select on public.invoices       to service_role;

grant select, insert on public.email_log to service_role;
