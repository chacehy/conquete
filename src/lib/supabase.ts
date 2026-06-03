import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgwytvwcvxqwouxvxrgq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_24yjkedygZVkIOp8ekhpAw_tr7G-ZHG';

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
