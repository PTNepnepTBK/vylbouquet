const supabase = require('../lib/supabase');

/**
 * OrderLog Model - Supabase Client Implementation
 */
class OrderLog {
  static tableName = 'order_logs';

  /**
   * Find all order logs
   */
  static async findAll(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Order by created_at
      if (options.order) {
        const [[field, direction]] = options.order;
        query = query.order(field, { ascending: direction === 'ASC' });
      } else {
        query = query.order('created_at', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('OrderLog.findAll error:', error);
      return [];
    }
  }

  /**
   * Create new order log
   */
  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([{
          order_id: data.order_id,
          admin_id: data.admin_id || null,
          previous_status: data.previous_status || null,
          new_status: data.new_status,
          notes: data.notes || null,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('OrderLog.create error:', error);
      throw error;
    }
  }
}

module.exports = OrderLog;
