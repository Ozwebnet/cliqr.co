# Database Setup Instructions

This document provides step-by-step instructions for setting up the enhanced invitation workflow database schema in your Supabase project.

## Overview

The enhanced invitation workflow requires new database tables and functions to support the two-stage onboarding process. This migration adds:

- `invitation_onboarding` table for managing invitation states
- `admin_action_logs` table for audit trails
- Custom enums and functions for invitation management
- Row Level Security (RLS) policies
- Database indexes for performance

## Important Note: Foreign Key Constraints

**Issue Fixed**: The original migration had a foreign key constraint issue where it tried to reference `public.users(team_id)`. Since `team_id` is not unique (multiple users share the same team), this caused the error:

```
ERROR: 42830: there is no unique constraint matching given keys for referenced table "users"
```

**Solution**: The `team_id` field in `invitation_onboarding` is now defined as `UUID NOT NULL` without a foreign key constraint, since teams are managed as a grouping field rather than a separate table.

## Prerequisites

1. Access to your Supabase project dashboard
2. SQL Editor permissions in Supabase
3. Understanding of your current user/team structure

## Migration Steps

### Step 1: Access Supabase SQL Editor

1. Log into your Supabase dashboard
2. Navigate to your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Migration

1. Copy the entire contents of `database_migrations/001_create_invitation_onboarding_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

### Step 3: Verify Installation

After running the migration, verify the setup by checking:

1. **Tables Created**:
   ```sql
   -- Check if tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('invitation_onboarding', 'admin_action_logs');
   ```

2. **Enum Types**:
   ```sql
   -- Check if enum type exists
   SELECT typname 
   FROM pg_type 
   WHERE typname = 'invitation_status';
   ```

3. **Functions**:
   ```sql
   -- Check if functions exist
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('get_enhanced_pending_invitations', 'cleanup_expired_invitations');
   ```

### Step 4: Test the Setup

Run a test query to ensure everything works:

```sql
-- Test getting pending invitations (replace with your team_id)
SELECT get_enhanced_pending_invitations('your-team-id-here');
```

## Rollback Instructions

If you need to rollback the changes:

```sql
-- Drop tables and related objects
DROP TABLE IF EXISTS admin_action_logs CASCADE;
DROP TABLE IF EXISTS invitation_onboarding CASCADE;
DROP FUNCTION IF EXISTS get_enhanced_pending_invitations(UUID);
DROP FUNCTION IF EXISTS cleanup_expired_invitations();
DROP FUNCTION IF EXISTS trigger_expire_invitations();
DROP TYPE IF EXISTS invitation_status;
```

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure you have admin access to your Supabase project
   - Check that your user has SQL execution permissions

2. **Table Already Exists**
   - If tables already exist from a previous attempt, drop them first:
   ```sql
   DROP TABLE IF EXISTS invitation_onboarding CASCADE;
   DROP TABLE IF EXISTS admin_action_logs CASCADE;
   ```

3. **Foreign Key Constraint Errors**
   - This has been fixed in the current migration
   - The `team_id` field no longer has a foreign key constraint since teams are managed through shared IDs

4. **RLS Policy Issues**
   - Ensure your `public.users` table has the expected structure
   - Check that users have proper `team_id` and `role` fields

### Verification Queries

Test that the system is working correctly:

```sql
-- 1. Check table structure
\d invitation_onboarding
\d admin_action_logs

-- 2. Test RLS policies are enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('invitation_onboarding', 'admin_action_logs');

-- 3. Test functions work
SELECT cleanup_expired_invitations();
```

## Next Steps

After successful migration:

1. **Update Application Code**: Ensure your application uses the new enhanced invitation functions
2. **Test Invitation Flow**: Create a test invitation to verify the workflow
3. **Monitor Performance**: The migration includes indexes, but monitor query performance
4. **Backup Strategy**: Ensure your backup strategy includes the new tables

## Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify your current database schema matches expectations
3. Ensure all foreign key references point to existing, valid tables
4. Consider running the migration in parts if there are dependency issues

## Schema Details

### Tables Created

- `invitation_onboarding`: Main table for invitation workflow management
- `admin_action_logs`: Audit trail for administrative actions

### Key Features

- **Status Tracking**: Comprehensive invitation status management
- **Audit Logging**: Complete audit trail for admin actions
- **Security**: Row Level Security policies for data protection
- **Performance**: Optimized indexes for common queries
- **Flexibility**: JSONB fields for extensible form data storage 