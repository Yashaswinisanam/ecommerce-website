import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, paymentStatus } = await req.json();

    if (!process.env.MONGODB_URI) {
       const mockOrders = (global as unknown as { mockOrders?: { _id?: string; id?: string; status?: string; paymentStatus?: string }[] }).mockOrders || [];
       const orderIndex = mockOrders.findIndex((o) => o._id === id || o.id === id);
       
       if (orderIndex === -1) {
         return NextResponse.json({ error: 'Order not found' }, { status: 404 });
       }
       
       if (status) mockOrders[orderIndex].status = status;
       if (paymentStatus) mockOrders[orderIndex].paymentStatus = paymentStatus;
       
       return NextResponse.json(mockOrders[orderIndex]);
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
