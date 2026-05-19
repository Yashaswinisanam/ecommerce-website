import { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
    }
  ],
  shippingInfo: {
    name: { type: String },
    phone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentInfo: {
    id: { type: String },
    status: { 
      type: String, 
      enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'unpaid'
    },
    method: { type: String, default: 'Stripe' },
    transactionId: { type: String },
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'processing', 
      'paid', 
      'packed', 
      'shipped', 
      'out_for_delivery', 
      'delivered', 
      'cancelled', 
      'returned', 
      'refunded'
    ],
    default: 'pending',
  },
  // Shipping tracking
  courierName: {
    type: String,
    default: '',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  estimatedDeliveryDate: {
    type: Date,
  },
  returnReason: {
    type: String,
    default: '',
  },
  refundTransactionId: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

// Adding indexes
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });

const Order = models.Order || model('Order', OrderSchema);

export default Order;
