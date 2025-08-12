import axiosInstance from '../axiosInstance';

// ===== SHIPPING RATE CALCULATIONS =====

/**
 * Get shipping options for cart items (main shipping calculation)
 */
export const getShippingOptions = async (cartItems: any[], customerAddress: any) => {
  try {
    const response = await axiosInstance.post('/shipping/shipments/', {
      cartItems,
      customerAddress
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get shipping rates for specific seller (alternative method)
 */
export const getShippingRates = async (sellerAddress: any, customerAddress: any, items: any) => {
  try {
    const response = await axiosInstance.post('/shipping/shipments/rates', {
      sellerAddress,
      customerAddress,
      items
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== SUBORDER SHIPPING LABEL MANAGEMENT =====

/**
 * Create shipping label for a suborder using stored rateId
 * This is the main function sellers will use
 */
export const createSubOrderLabel = async (subOrderId: string) => {
  try {
    const response = await axiosInstance.post('/shipping/suborder/label', { 
      subOrderId 
    });
    // console.log('Suborder label created successfully:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get existing shipping label for a suborder
 */
export const getSubOrderLabel = async (subOrderId: string) => {
  try {
    const response = await axiosInstance.get(`/shipping/suborder/${subOrderId}/label`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark suborder as shipped with tracking info
 */
export const markSubOrderAsShipped = async (subOrderId: string, shippingData: {
  trackingNumber: string;
  carrier: string;
}) => {
  try {
    const response = await axiosInstance.post('/shipping/suborder/ship', {
      subOrderId,
      trackingNumber: shippingData.trackingNumber,
      carrier: shippingData.carrier
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== DIRECT SHIPPING LABEL CREATION =====

/**
 * Create shipping label directly with rateId (legacy method)
 */
export const createShippingLabel = async (rateId: string) => {
  try {
    const response = await axiosInstance.post('/shipping/shipments/labels/', { 
      rateId 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== ORDER STATUS MANAGEMENT =====

/**
 * Update suborder fulfillment status and tracking info
 */
export const updateSubOrderStatus = async (subOrderId: string, updateData: {
  fulfillmentStatus?: string;
  trackingNumber?: string;
  trackingUrlProvider?: string;
  labelUrl?: string;
  carrier?: string;
  cancelReason?: string;
  [key: string]: any;
}) => {
  try {
    // Transform the data to match backend API expectations
    const payload: any = {};
    
    if (updateData.fulfillmentStatus) {
      payload.status = updateData.fulfillmentStatus; // Backend expects 'status', not 'fulfillmentStatus'
    }

    // console.log('Update Data:', updateData);
    
    // If tracking info is provided, structure it properly
    if (updateData.trackingNumber || updateData.labelUrl || updateData.carrier) {
      payload.trackingInfo = {
        trackingNumber: updateData.trackingNumber,
        labelUrl: updateData.labelUrl,
        carrier: updateData.carrier
      };
    }
    
    const response = await axiosInstance.patch(`/orders/sub/${subOrderId}/status`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== TRACKING & MONITORING =====

/**
 * Track standard shipment by tracking number and carrier
 */
export const trackShipment = async (trackingNumber: string, carrier: string) => {
  try {
    const response = await axiosInstance.post('/shipping/shipments/tracks/', {
      trackingNumber,
      carrier
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * List all shipments with pagination
 */
export const listAllShipments = async (page: number = 1, results: number = 25) => {
  try {
    const response = await axiosInstance.get('/shipping/shipments', {
      params: { page, results }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get specific shipment details
 */
export const getShipmentDetails = async (shipmentId: string) => {
  try {
    const response = await axiosInstance.get(`/shipping/shipment/${shipmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== UBER SAME-DAY DELIVERY (if enabled) =====

/**
 * Create Uber delivery
 */
export const createUberDelivery = async (quoteId: string, sellerAddress: any, customerInfo: any, items: any[]) => {
  try {
    const response = await axiosInstance.post('/shipping/shipments/delivery', {
      quoteId,
      sellerAddress,
      customerInfo,
      items
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Track Uber delivery
 */
export const trackUberDelivery = async (deliveryId: string) => {
  try {
    const response = await axiosInstance.get(`/shipping/shipments/delivery/${deliveryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ===== DEPRECATED/CUSTOM FUNCTIONS =====
// These functions may need custom backend endpoints if needed

/**
 * Email shipping label to seller
 */
export const emailShippingLabel = async (labelUrl: string, sellerEmail: string, orderId?: string, trackingNumber?: string) => {
  try {
    const response = await axiosInstance.post('/shipping/email-label', {
      labelUrl,
      email: sellerEmail,
      orderId,
      trackingNumber
    });
    console.log('Shipping label emailed successfully:', response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save shipping label (requires custom endpoint)
 * Note: This endpoint doesn't exist in the current backend
 */
export const saveShippingLabel = async (labelUrl: string, subOrderId: string) => {
  try {
    // This endpoint needs to be implemented in backend if needed
    const response = await axiosInstance.post('/shipping/save-label', {
      labelUrl,
      subOrderId
    });
    return response.data;
  } catch (error) {
    console.warn('Save shipping label endpoint not implemented in backend');
    throw error;
  }
};
