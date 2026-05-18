import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
       // Return mock orders for demo
       const mockOrders = (global as unknown as { mockOrders?: unknown[] }).mockOrders || [];
       return NextResponse.json(mockOrders); 
    }
    await connectDB();
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
