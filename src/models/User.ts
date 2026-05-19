import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  refreshToken: {
    type: String,
    select: false,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  cartData: {
    type: Object,
    default: {},
  },
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }
  ],
  addresses: [
    {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    }
  ],
  savedPayments: [
    {
      brand: { type: String },
      last4: { type: String },
      expiry: { type: String },
      token: { type: String },
    }
  ]
}, {
  timestamps: true,
});

// Adding index for optimal retrieval
UserSchema.index({ email: 1 });

const User = models.User || model('User', UserSchema);

export default User;
