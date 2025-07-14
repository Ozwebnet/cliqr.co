import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkplvonqdtagwdctsibp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcGx2b25xZHRhZ3dkY3RzaWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Nzg0OTcsImV4cCI6MjA2NTE1NDQ5N30.zHdLGr9Nn9DyAjByn1uIAMavlgQQE73kx60eAOddwW8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);