import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://spgommqxdrvpizlnlidm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ29tbXF4ZHJ2cGl6bG5saWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAyODQsImV4cCI6MjA2NjAyNjI4NH0.eTLL0v9tR8gfpABablkEtBDm6yr4H_EyvjMYlGIQ3T0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 