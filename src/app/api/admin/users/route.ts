import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
       return NextResponse.json([
         { _id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: new Date() },
         { _id: '2', name: 'Demo User', email: 'demo@example.com', role: 'user', createdAt: new Date() },
       ]);
    }
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
