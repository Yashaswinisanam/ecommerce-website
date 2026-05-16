import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
       return NextResponse.json([]); // Return empty for demo
    }
    await connectDB();
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
