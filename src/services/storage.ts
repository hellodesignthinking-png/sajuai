import { supabase } from '../lib/supabase';
import type { UserInput, AnalysisResult } from '../types';

export interface StoredResult {
  id: string;
  input: UserInput;
  result: AnalysisResult;
  created_at: string;
  expires_at: string;
}

export async function saveResult(input: UserInput, result: AnalysisResult): Promise<{ id: string | null; error: string | null }> {
  if (!supabase) return { id: null, error: 'Supabase가 설정되지 않았습니다.' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { id: null, error: '로그인이 필요합니다.' };

  const { data, error } = await supabase
    .from('analysis_results')
    .insert({ user_id: user.id, input, result })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };
  return { id: data.id, error: null };
}

export async function getMyResults(): Promise<{ data: StoredResult[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Supabase가 설정되지 않았습니다.' };

  const { data, error } = await supabase
    .from('analysis_results')
    .select('id, input, result, created_at, expires_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return { data: [], error: error.message };
  return { data: (data as StoredResult[]) ?? [], error: null };
}

export async function getResult(id: string): Promise<{ data: StoredResult | null; error: string | null }> {
  if (!supabase) return { data: null, error: 'Supabase가 설정되지 않았습니다.' };

  const { data, error } = await supabase
    .from('analysis_results')
    .select('id, input, result, created_at, expires_at')
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as StoredResult, error: null };
}

export async function deleteResult(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase가 설정되지 않았습니다.' };

  const { error } = await supabase
    .from('analysis_results')
    .delete()
    .eq('id', id);

  return { error: error?.message ?? null };
}
