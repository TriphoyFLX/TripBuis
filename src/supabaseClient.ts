import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ngfshsveswxalsvekslu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZnNoc3Zlc3d4YWxzdmVrc2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MDgxMjEsImV4cCI6MjA4MjQ4NDEyMX0.JLGSX53buSxrnvUGa1DVj9pfESA-UtwjKxJNTAIcasE';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
