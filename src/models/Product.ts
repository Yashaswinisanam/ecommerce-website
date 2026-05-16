import mongoose, { Schema, model, models } from 'mongoose';

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
  }
}, {
  timestamps: true,
});

const Product = models.Product || model('Product', ProductSchema);

export default Product;
