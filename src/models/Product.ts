import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  images: [String],
  helpfulCount: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, 'Please provide product stock'],
    default: 0,
  },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    }
  ],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // Advanced Specifications
  specifications: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true },
    }
  ],
  warrantyPeriod: {
    type: String,
    default: '2 Year Warranty',
  },
  deliveryEstimate: {
    type: String,
    default: 'Estimated 3-5 days delivery',
  },
  returnEligibility: {
    type: Boolean,
    default: true,
  },
  returnDuration: {
    type: Number,
    default: 30, // in days
  },
  returnPolicy: {
    type: String,
    default: '30-Day no-questions-asked refund policy',
  },
  sellerDetails: {
    name: { type: String, default: 'GRAVITY Authorized Seller' },
    rating: { type: Number, default: 4.8 },
  },
  // Ratings & Reviews Integration
  reviews: [ReviewSchema],
  averageRating: {
    type: Number,
    default: 4.8,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  ratingBreakdown: {
    type: [Number],
    default: [0, 0, 0, 0, 0], // counts for 1, 2, 3, 4, 5 stars
  }
}, {
  timestamps: true,
});

// Adding optimal indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1 });

const Product = models.Product || model('Product', ProductSchema);

export default Product;
