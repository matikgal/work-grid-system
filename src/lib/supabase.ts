import { createClient } from '@supabase/supabase-js';

const PROD_SUPABASE_URL = 'https://bulommicnrltibxcnwdk.supabase.co';
const PROD_SUPABASE_ANON_KEY = 'sb_publishable_6rofdGJ4sHjznnLFJHn5rw_PM8fO4sS';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? PROD_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? PROD_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
