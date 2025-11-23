const supabase = require('../lib/supabase');

/**
 * Bouquet Model - Supabase Client Implementation
 */
class Bouquet {
  static tableName = 'bouquets';

  /**
   * Find all bouquets
   */
  static async findAll(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      // Handle where conditions
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Handle order
      if (options.order) {
        const [[field, direction]] = options.order;
        query = query.order(field, { ascending: direction === 'ASC' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Bouquet.findAll error:', error);
      return [];
    }
  }

  /**
   * Find one bouquet
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
      console.error('Bouquet.findOne error:', error);
      return null;
    }
  }

  /**
   * Find bouquet by primary key
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
      console.error('Bouquet.findByPk error:', error);
      return null;
    }
  }

  /**
   * Count bouquets
   */
  static async count(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Bouquet.count error:', error);
      return 0;
    }
  }

  /**
   * Create new bouquet
   */
  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([{
          name: data.name,
          price: parseFloat(data.price),
          description: data.description || null,
          image_url: data.image_url || null,
          is_active: data.is_active !== undefined ? data.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Bouquet.create error:', error);
      throw error;
    }
  }

  /**
   * Update bouquet
   */
  static async update(updates, options = {}) {
    try {
      let query = supabase.from(this.tableName).update({
        ...updates,
        price: updates.price ? parseFloat(updates.price) : undefined,
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
      console.error('Bouquet.update error:', error);
      throw error;
    }
  }

  /**
   * Delete bouquet
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
      return 1;
    } catch (error) {
      console.error('Bouquet.destroy error:', error);
      throw error;
    }
  }
}

module.exports = Bouquet;
