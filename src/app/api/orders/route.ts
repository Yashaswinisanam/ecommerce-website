import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyAccessToken } from '@/lib/auth';

interface MockOrderUser {
  id: string;
  name: string;
  email: string;
}

interface MockOrderItem {
  _id?: string;
  id?: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface MockOrderShipping {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface MockOrderPayment {
  status: string;
  method: string;
}

interface MockOrder {
  _id: string;
  user: MockOrderUser | string;
  items: MockOrderItem[];
  shippingInfo: MockOrderShipping;
  paymentInfo: MockOrderPayment;
  subtotal: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: string;
  estimatedDeliveryDate: string;
  createdAt: string;
}

const globalObj = global as unknown as { mockOrders?: MockOrder[] };
if (!globalObj.mockOrders) {
  globalObj.mockOrders = [];
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token) as { id: string; role: string } | null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    if (!process.env.MONGODB_URI) {
      // Offline mode filter
      const mockOrders = globalObj.mockOrders || [];
      const userOrders = mockOrders.filter((o) => {
        const userId = typeof o.user === 'object' ? o.user.id : o.user;
        return userId === decoded.id;
      });
      return NextResponse.json(userOrders);
    }

    await connectDB();
    const orders = await Order.find({ user: decoded.id }).populate('items.product').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET Orders Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Authenticate the user from token
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    let userId = null;
    let userRole = null;

    if (token) {
      const decoded = verifyAccessToken(token) as { id: string; role: string } | null;
      if (decoded) {
        userId = decoded.id;
        userRole = decoded.role;
      }
    }

    if (!userId && body.user?.id) {
      userId = body.user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User session required' }, { status: 401 });
    }

    // Dynamic fee breakdown calculations
    const items: MockOrderItem[] = body.items || [];
    const subtotal = items.reduce((acc: number, item: MockOrderItem) => acc + (item.price * item.quantity), 0);
    const shippingPrice = subtotal >= 50 ? 0 : 10;
    const taxPrice = parseFloat((subtotal * 0.18).toFixed(2)); // 18% tax rate
    const totalPrice = parseFloat((subtotal + shippingPrice + taxPrice).toFixed(2));

    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 4); // 4 days estimate

    if (!process.env.MONGODB_URI) {
      // Offline Mode Fallback
      const newOrder: MockOrder = {
        _id: 'GRV-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        items,
        user: body.user || {
          id: userId,
          name: userRole === 'admin' ? 'Admin User' : 'Demo User',
          email: userRole === 'admin' ? 'admin@example.com' : 'user@example.com'
        },
        shippingInfo: {
          address: body.shipping?.address || body.shippingInfo?.address || 'N/A',
          city: body.shipping?.city || body.shippingInfo?.city || 'N/A',
          postalCode: body.shipping?.postalCode || body.shippingInfo?.postalCode || 'N/A',
          country: body.shipping?.country || body.shippingInfo?.country || 'N/A',
        },
        paymentInfo: {
          status: body.paymentStatus || 'paid',
          method: body.paymentMethod || 'Stripe'
        },
        subtotal,
        taxPrice,
        shippingPrice,
        totalPrice,
        status: 'pending',
        estimatedDeliveryDate: estDelivery.toISOString(),
        createdAt: new Date().toISOString()
      };
      globalObj.mockOrders?.unshift(newOrder);
      return NextResponse.json(newOrder, { status: 201 });
    }

    await connectDB();

    const dbOrderData = {
      user: userId,
      items: items.map((item: MockOrderItem) => ({
        product: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      shippingInfo: {
        address: body.shipping?.address || body.shippingInfo?.address || 'N/A',
        city: body.shipping?.city || body.shippingInfo?.city || 'N/A',
        postalCode: body.shipping?.postalCode || body.shippingInfo?.postalCode || 'N/A',
        country: body.shipping?.country || body.shippingInfo?.country || 'N/A',
      },
      paymentInfo: {
        status: body.paymentStatus || 'paid',
        method: body.paymentMethod || 'Stripe',
        id: body.paymentInfo?.id || '',
        transactionId: body.paymentInfo?.transactionId || '',
      },
      subtotal,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: (body.paymentStatus || 'paid').toLowerCase() === 'paid',
      paidAt: (body.paymentStatus || 'paid').toLowerCase() === 'paid' ? new Date() : undefined,
      status: 'pending',
      estimatedDeliveryDate: estDelivery
    };

    const order = await Order.create(dbOrderData);
    return NextResponse.json(order, { status: 201 });

  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
