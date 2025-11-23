const supabase = require('../lib/supabase');

/**
 * Order Model - Supabase Client Implementation
 */
class Order {
  static tableName = 'orders';

  /**
   * Find all orders with optional includes
   */
  static async findAll(options = {}) {
    try {
      let select = '*';

      // Handle includes (relations)
      if (options.include) {
        const includes = Array.isArray(options.include) ? options.include : [options.include];
        if (includes.some(inc => inc.model === 'Bouquet' || inc.association === 'Bouquet')) {
          select += ', bouquets(*)';
        }
        if (includes.some(inc => inc.model === 'OrderImage' || inc.association === 'OrderImage')) {
          select += ', order_images(*)';
        }
      }

      let query = supabase.from(this.tableName).select(select);

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

      // Transform to match Sequelize structure
      if (data && options.include) {
        return data.map(order => ({
          ...order,
          Bouquet: order.bouquets?.[0] || null,
          OrderImages: order.order_images || [],
        }));
      }

      return data || [];
    } catch (error) {
      console.error('Order.findAll error:', error);
      return [];
    }
  }

  /**
   * Find one order with optional includes
   */
  static async findOne(options = {}) {
    try {
      let select = '*';

      // Handle includes (relations)
      if (options.include) {
        const includes = Array.isArray(options.include) ? options.include : [options.include];
        if (includes.some(inc => inc.model === 'Bouquet' || inc.association === 'Bouquet')) {
          select += ', bouquets(*)';
        }
        if (includes.some(inc => inc.model === 'OrderImage' || inc.association === 'OrderImage')) {
          select += ', order_images(*)';
        }
      }

      let query = supabase.from(this.tableName).select(select);

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

      // Transform to match Sequelize structure
      if (data && options.include) {
        return {
          ...data,
          Bouquet: data.bouquets?.[0] || null,
          OrderImages: data.order_images || [],
        };
      }

      return data;
    } catch (error) {
      console.error('Order.findOne error:', error);
      return null;
    }
  }

  /**
   * Find order by primary key
   */
  static async findByPk(id, options = {}) {
    try {
      let select = '*';

      // Handle includes
      if (options.include) {
        const includes = Array.isArray(options.include) ? options.include : [options.include];
        if (includes.some(inc => inc.model === 'Bouquet' || inc.association === 'Bouquet')) {
          select += ', bouquets(*)';
        }
        if (includes.some(inc => inc.model === 'OrderImage' || inc.association === 'OrderImage')) {
          select += ', order_images(*)';
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select(select)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      // Transform to match Sequelize structure
      if (data && options.include) {
        return {
          ...data,
          Bouquet: data.bouquets?.[0] || null,
          OrderImages: data.order_images || [],
        };
      }

      return data;
    } catch (error) {
      console.error('Order.findByPk error:', error);
      return null;
    }
  }

  /**
   * Count orders
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
      console.error('Order.count error:', error);
      return 0;
    }
  }

  /**
   * Create new order
   */
  static async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([{
          order_number: data.order_number,
          bouquet_id: data.bouquet_id,
          customer_name: data.customer_name,
          sender_name: data.sender_name,
          sender_account_number: data.sender_account_number || null,
          sender_phone: data.sender_phone || null,
          bouquet_price: parseFloat(data.bouquet_price),
          payment_type: data.payment_type,
          payment_method: data.payment_method || null,
          dp_amount: parseFloat(data.dp_amount || 0),
          remaining_amount: parseFloat(data.remaining_amount || 0),
          total_paid: parseFloat(data.total_paid || 0),
          pickup_date: data.pickup_date,
          pickup_time: data.pickup_time,
          additional_request: data.additional_request || null,
          card_message: data.card_message || null,
          reference_image_url: data.reference_image_url || null,
          payment_proof_url: data.payment_proof_url || null,
          order_status: data.order_status || 'WAITING_CONFIRMATION',
          payment_status: data.payment_status || 'UNPAID',
          whatsapp_sent: data.whatsapp_sent || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Order.create error:', error);
      throw error;
    }
  }

  /**
   * Update order
   */
  static async update(updates, options = {}) {
    try {
      const updateData = { ...updates };

      // Handle price fields
      if (updateData.bouquet_price) updateData.bouquet_price = parseFloat(updateData.bouquet_price);
      if (updateData.dp_amount) updateData.dp_amount = parseFloat(updateData.dp_amount);
      if (updateData.remaining_amount) updateData.remaining_amount = parseFloat(updateData.remaining_amount);
      if (updateData.total_paid) updateData.total_paid = parseFloat(updateData.total_paid);

      updateData.updated_at = new Date().toISOString();

      let query = supabase.from(this.tableName).update(updateData);

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.select();

      if (error) throw error;
      return [data?.length || 0, data || []];
    } catch (error) {
      console.error('Order.update error:', error);
      throw error;
    }
  }

  /**
   * Delete order
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
      console.error('Order.destroy error:', error);
      throw error;
    }
  }
}

module.exports = Order;
