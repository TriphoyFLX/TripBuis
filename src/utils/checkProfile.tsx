import { supabase } from '../supabaseClient';

export async function checkProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return true;
}
