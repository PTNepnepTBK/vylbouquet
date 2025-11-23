const supabase = require('../lib/supabase');

/**
 * Setting Model - Supabase Client Implementation
 */
class Setting {
  static tableName = 'settings';

  /**
   * Find all settings
   */
  static async findAll(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Setting.findAll error:', error);
      return [];
    }
  }

  /**
   * Find one setting
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
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Setting.findOne error:', error);
      return null;
    }
  }

  /**
   * Create new setting
   */
  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([{
          key: data.key,
          value: data.value || null,
          description: data.description || null,
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Setting.create error:', error);
      throw error;
    }
  }

  /**
   * Update setting
   */
  static async update(updates, options = {}) {
    try {
      let query = supabase.from(this.tableName).update({
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.select();

      if (error) throw error;
      return [data?.length || 0, data || []];
    } catch (error) {
      console.error('Setting.update error:', error);
      throw error;
    }
  }

  /**
   * Upsert setting (update if exists, create if not)
   */
  static async upsert(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .upsert({
          key: data.key,
          value: data.value || null,
          description: data.description || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        })
        .select();

      if (error) {
        console.error('Setting.upsert error details:', error);
        throw error;
      }
      
      return result?.[0] || result;
    } catch (error) {
      console.error('Setting.upsert error:', error);
      throw error;
    }
  }

  /**
   * Bulk upsert settings
   */
  static async bulkCreate(dataArray, options = {}) {
    try {
      const records = dataArray.map(item => ({
        key: item.key,
        value: item.value || null,
        description: item.description || null,
        updated_at: new Date().toISOString(),
      }));

      if (options.updateOnDuplicate) {
        const { data, error } = await supabase
          .from(this.tableName)
          .upsert(records, { onConflict: 'key' })
          .select();

        if (error) throw error;
        return data || [];
      } else {
        const { data, error } = await supabase
          .from(this.tableName)
          .insert(records)
          .select();

        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error('Setting.bulkCreate error:', error);
      throw error;
    }
  }
}

module.exports = Setting;
