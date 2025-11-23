const supabase = require('../lib/supabase');

/**
 * OrderImage Model - Supabase Client Implementation
 */
class OrderImage {
  static tableName = 'order_images';

  /**
   * Find all order images
   */
  static async findAll(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Order by display_order
      if (options.order) {
        const [[field, direction]] = options.order;
        query = query.order(field, { ascending: direction === 'ASC' });
      } else {
        query = query.order('display_order', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('OrderImage.findAll error:', error);
      return [];
    }
  }

  /**
   * Create new order image
   */
  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([{
          order_id: data.order_id,
          image_url: data.image_url,
          image_type: data.image_type,
          display_order: data.display_order || 0,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('OrderImage.create error:', error);
      throw error;
    }
  }

  /**
   * Bulk create order images
   */
  static async bulkCreate(dataArray) {
    try {
      const records = dataArray.map(item => ({
        order_id: item.order_id,
        image_url: item.image_url,
        image_type: item.image_type,
        display_order: item.display_order || 0,
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(records)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('OrderImage.bulkCreate error:', error);
      throw error;
    }
  }

  /**
   * Delete order images
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
      console.error('OrderImage.destroy error:', error);
      throw error;
    }
  }
}

module.exports = OrderImage;
