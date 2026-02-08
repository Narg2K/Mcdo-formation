
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Employee, ActivityLog, GlobalCertConfig, ContractConfig, Inquiry } from '../types';

const SUPABASE_URL = 'https://nyjhhccdhhvxalqzmpqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Y4YRgREfVhleGXmDiQU75A__nEz3CEh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const toSqlDate = (dateStr?: string) => {
  if (!dateStr || dateStr.trim() === "") return null;
  // Ensure the date is in a format Postgres can parse if it's not already
  if (dateStr.includes('/') && dateStr.split('/').length === 3) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  }
  return dateStr;
};

export const apiService = {
  // --- AUTHENTIFICATION & PROFIL ---
  async signIn(email: string, pass: string) {
    return await (supabase.auth as any).signInWithPassword({ email, password: pass });
  },

  async signUp(email: string, pass: string, firstName: string, lastName: string, role: string) {
    return await (supabase.auth as any).signUp({ 
      email, 
      password: pass,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    });
  },

  async signOut() {
    return await (supabase.auth as any).signOut();
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return { data, error };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  async updateUserProfile(userId: string, data: { first_name: string, last_name: string }) {
    return await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
  },

  // --- RÉFÉRENTIELS (SETTINGS) ---
  async getSettings() {
    try {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error || !data) return { skills: [], certs: [], contracts: [] };
      
      const skills = data.find(d => d.key === 'mcfo_skills')?.value || [];
      const certs = data.find(d => d.key === 'mcfo_certs')?.value || [];
      const contracts = data.find(d => d.key === 'mcfo_contracts')?.value || [];
      
      return { skills, certs, contracts };
    } catch (e) {
      return { skills: [], certs: [], contracts: [] };
    }
  },

  async saveSettings(key: string, data: any) {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ 
        key, 
        value: data, 
        updated_at: new Date().toISOString() 
      });
    if (error) console.error('Supabase Error (saveSettings):', error);
  },

  // --- EMPLOYEES ---
  async getEmployees(type: 'active' | 'archived' | 'deleted' = 'active'): Promise<Employee[]> {
    try {
      let query = supabase.from('employees').select('*');
      
      if (type === 'active') {
        query = query.eq('is_archived', false).eq('is_deleted', false);
      } else if (type === 'archived') {
        query = query.eq('is_archived', true);
      } else if (type === 'deleted') {
        query = query.eq('is_deleted', true);
      }

      const { data, error } = await query;
      if (error) {
        console.warn(`Erreur fetching employees ${type}:`, error.message);
        return [];
      }
      
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        department: row.department,
        skills: row.skills || [],
        trainings: row.trainings || [],
        certifications: row.certifications || [],
        availability: row.availability || [],
        entryDate: row.entry_date,
        contractEndDate: row.contract_end_date,
        phoneNumber: row.phone_number,
        contractType: row.contract_type,
        eventLogs: row.event_logs || [],
        feedbacks: row.feedbacks || [],
        isArchived: row.is_archived,
        isDeleted: row.is_deleted,
        archivedDate: row.archived_date,
        archivedReason: row.archived_reason,
        deletedDate: row.deleted_date
      })) as Employee[];
    } catch (e) {
      console.error("Erreur lors de la récupération des employés:", e);
      return [];
    }
  },

  async saveEmployees(employees: Employee[]) {
    if (!employees || employees.length === 0) return;
    try {
      const payload = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        department: emp.department || emp.role,
        skills: emp.skills,
        trainings: emp.trainings,
        certifications: emp.certifications,
        availability: emp.availability,
        entry_date: toSqlDate(emp.entryDate),
        contract_end_date: toSqlDate(emp.contractEndDate),
        phone_number: emp.phoneNumber,
        contract_type: emp.contractType,
        event_logs: emp.eventLogs || [],
        feedbacks: emp.feedbacks || [],
        is_archived: emp.isArchived ?? false,
        is_deleted: emp.isDeleted ?? false,
        archived_date: toSqlDate(emp.archivedDate),
        archived_reason: emp.archivedReason,
        deleted_date: toSqlDate(emp.deletedDate)
      }));

      const { error } = await supabase.from('employees').upsert(payload, { onConflict: 'id' });
      if (error) console.error('Supabase Error (saveEmployees):', error.message);
    } catch (e) {
      console.error("Échec sync saveEmployees:", e);
    }
  },

  // --- LOGS D'ACTIVITÉ ---
  async getLogs(): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) return [];
      return data.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        user: log.user_name,
        action: log.action,
        details: log.details,
        category: log.category as any
      }));
    } catch (e) {
      return [];
    }
  },

  async addLog(log: ActivityLog) {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          id: log.id,
          user_name: log.user,
          action: log.action,
          details: log.details,
          category: log.category
        }]);
      if (error) console.error('Supabase Error (addLog):', error);
    } catch (e) {
      console.error("Fail addLog:", e);
    }
  },

  async submitInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'created_at'>) {
    return await supabase.from('inquiries').insert([inquiry]);
  }
};
