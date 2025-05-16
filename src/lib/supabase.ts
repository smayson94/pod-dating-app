import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  gender?: 'woman' | 'man' | 'non_binary' | 'genderqueer' | 'other';
  orientation?: 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'pansexual' | 'asexual' | 'other';
  relationship_status?: 'single' | 'dating' | 'married' | 'its_complicated';
  birth_date?: string;
  location?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type Pod = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type PodMember = {
  id: string;
  pod_id: string;
  profile_id: string;
  joined_at?: string;
};

export type Message = {
  id: string;
  pod_id: string;
  sender_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

export type Like = {
  id: string;
  liker_id: string;
  likee_id: string;
  created_at?: string;
}; 