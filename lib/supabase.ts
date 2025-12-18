import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bulommicnrltibxcnwdk.supabase.co';
const supabaseAnonKey = 'sb_publishable_6rofdGJ4sHjznnLFJHn5rw_PM8fO4sS';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
