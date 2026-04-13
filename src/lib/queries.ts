import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function getSiteSettings() {
  try {
    const { data, error } = await supabaseAdmin.from('site_settings').select('key, value');
    if (error) throw error;
    
    return data?.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {}) || {};
  } catch (error) {
    console.error("Erreur getSiteSettings:", error);
    return {};
  }
}

export async function getFeatures(context: string) {
  try {
    const { data, error } = await supabaseAdmin.from('expertise_features').select('*').eq('page_context', context).order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur getFeatures:", error);
    return [];
  }
}