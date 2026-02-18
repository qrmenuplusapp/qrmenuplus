import { supabase } from './supabase';

// تسجيل عميل جديد
export async function createClient(data: {
  name: string;
  subdomain: string;
  email?: string;
  phone?: string;
  plan: string;
  username: string;
  password: string;
}) {
  try {
    // 1. إضافة العميل في جدول clients
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: data.name,
        subdomain: data.subdomain,
        plan: data.plan,
        status: data.plan === 'trial' ? 'trial' : 'active',
        email: data.email,
        phone: data.phone,
      })
      .select()
      .single();

    if (clientError) throw clientError;

    // 2. إضافة بيانات الدخول في جدول users
    const { error: userError } = await supabase
      .from('users')
      .insert({
        client_id: client.id,
        username: data.username,
        password_hash: data.password, // TODO: تشفير كلمة المرور
        role: 'client',
      });

    if (userError) throw userError;

    return { success: true, client };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// تسجيل الدخول
export async function login(username: string, password: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, clients(*)')
      .eq('username', username)
      .eq('password_hash', password) // TODO: تشفير كلمة المرور
      .single();

    if (error || !data) {
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    return { success: true, user: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// جلب جميع العملاء
export async function getAllClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, clients: data };
  } catch (error: any) {
    return { success: false, error: error.message, clients: [] };
  }
}