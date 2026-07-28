-- Enable Row Level Security on every table in the public schema.
-- No policies are added: this defaults to deny-all for the `anon` and
-- `authenticated` roles that Supabase's PostgREST/GraphQL API uses.
-- The app's own connection (via DATABASE_URL/DIRECT_URL, table owner)
-- is unaffected, since RLS does not restrict a table's owner unless
-- FORCE ROW LEVEL SECURITY is also set (it isn't, here).

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lead_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lead_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."follow_ups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."proposals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quotations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."quotation_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."client_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."client_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."client_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."client_onboarding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."project_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."task_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ticket_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;

-- Prisma's own migration-tracking table is also public-schema and flagged
-- by the linter. Safe to lock down the same way.
-- ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;