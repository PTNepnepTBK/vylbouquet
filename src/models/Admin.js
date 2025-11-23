const supabase = require('../lib/supabase');

/**
 * Admin Model - Supabase Client Implementation
 */
class Admin {
  static tableName = 'admins';

  /**
   * Find admin by username
   */
  static async findOne(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Admin.findOne error:', error);
      return null;
    }
  }

  /**
   * Find admin by primary key
   */
  static async findByPk(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Admin.findByPk error:', error);
      return null;
    }
  }

  /**
   * Create new admin
   */
  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([{
          username: data.username,
          password: data.password,
          full_name: data.full_name,
          email: data.email || null,
          is_active: data.is_active !== undefined ? data.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Admin.create error:', error);
      throw error;
    }
  }

  /**
   * Update admin
   */
  static async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Admin.update error:', error);
      throw error;
    }
  }

  /**
   * Delete admin
   */
  static async destroy(options = {}) {
    try {
      let query = supabase.from(this.tableName).delete();

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { error } = await query;
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Admin.destroy error:', error);
      throw error;
    }
  }
}

module.exports = Admin;
