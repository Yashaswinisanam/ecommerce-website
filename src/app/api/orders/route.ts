import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

const globalObj = global as unknown as { mockOrders?: unknown[] };
if (!globalObj.mockOrders) {
  globalObj.mockOrders = [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!process.env.MONGODB_URI) {
       // Demo Mode Fallback
       const newOrder = {
         _id: Math.random().toString(36).substr(2, 9).toUpperCase(),
         ...body,
         status: 'Processing',
         paymentStatus: 'Paid',
         createdAt: new Date().toISOString()
       };
       globalObj.mockOrders?.unshift(newOrder);
       return NextResponse.json(newOrder, { status: 201 });
    }

    await connectDB();
    const order = await Order.create(body);
    return NextResponse.json(order, { status: 201 });

  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
