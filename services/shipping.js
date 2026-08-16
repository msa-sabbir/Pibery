/**
 * Pibery Platform - Local Shipping & Courier Integration (Pathao & Steadfast)
 * Automates parcel creation, delivery status checking, and shipping rate estimation in Bangladesh.
 */

const axios = require('axios');

class LocalShippingService {
  constructor() {
    this.pathaoBaseUrl = 'https://api-hermes.pathao.com'; // Sandbox / Production
    this.steadfastBaseUrl = 'https://portal.packzy.com/api/v1';
  }

  // Pathao Courier: Create Order / Parcel
  async createPathaoOrder(orderData, merchantCredentials) {
    try {
      // 1. Get Token first if needed, using merchantCredentials.pathaoAccessToken
      const token = merchantCredentials?.pathaoAccessToken || process.env.PATHAO_ACCESS_TOKEN;
      if (!token) {
        return { success: false, message: 'Pathao access token পাওয়া যায়নি' };
      }

      const payload = {
        store_id: Number(merchantCredentials?.pathaoStoreId || process.env.PATHAO_STORE_ID),
        merchant_order_id: orderData.orderId,
        recipient_name: orderData.customerName,
        recipient_phone: orderData.customerPhone,
        recipient_address: orderData.customerAddress,
        delivery_type: 48, // 48 for normal delivery
        item_quantity: orderData.itemQuantity || 1,
        item_weight: orderData.itemWeight || 0.5,
        amount_to_collect: orderData.codAmount || 0,
        item_description: orderData.description || 'E-commerce Order from Pibery Store',
      };

      const res = await axios.post(`${this.pathaoBaseUrl}/aladdin/v1/orders`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return { success: true, provider: 'pathao', data: res.data };
    } catch (err) {
      return { success: false, provider: 'pathao', error: err.response?.data || err.message };
    }
  }

  // Steadfast Courier: Create Order / Parcel
  async createSteadfastOrder(orderData, merchantCredentials) {
    try {
      const apiKey = merchantCredentials?.steadfastApiKey || process.env.STEADFAST_API_KEY;
      const secretKey = merchantCredentials?.steadfastSecretKey || process.env.STEADFAST_SECRET_KEY;

      if (!apiKey || !secretKey) {
        return { success: false, message: 'Steadfast API Key বা Secret Key পাওয়া যায়নি' };
      }

      const payload = {
        invoice: orderData.orderId,
        recipient_name: orderData.customerName,
        recipient_phone: orderData.customerPhone,
        recipient_address: orderData.customerAddress,
        cod_amount: orderData.codAmount || 0,
        note: orderData.note || 'Delivered via Pibery Builder',
      };

      const res = await axios.post(`${this.steadfastBaseUrl}/create_order`, payload, {
        headers: {
          'Api-Key': apiKey,
          'Secret-Key': secretKey,
          'Content-Type': 'application/json',
        },
      });

      return { success: true, provider: 'steadfast', data: res.data };
    } catch (err) {
      return { success: false, provider: 'steadfast', error: err.response?.data || err.message };
    }
  }
}

module.exports = new LocalShippingService();
