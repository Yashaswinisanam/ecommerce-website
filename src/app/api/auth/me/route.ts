import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken } from '@/lib/auth';

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
      // Demo offline mode fallback
      const isAdmin = decoded.role === 'admin';
      const mockUser = {
        id: decoded.id,
        name: isAdmin ? 'Admin User' : 'Demo User',
        email: isAdmin ? 'admin@example.com' : 'user@example.com',
        role: decoded.role,
        avatarUrl: '',
        wishlist: [],
        addresses: [
          {
            name: isAdmin ? 'Admin User' : 'Demo User',
            phone: '+1 555-0199',
            street: '100 Infinite Loop, Suite 10',
            city: 'Cupertino',
            postalCode: '95014',
            country: 'United States',
            isDefault: true,
          }
        ],
        savedPayments: [
          {
            brand: 'Visa',
            last4: '4242',
            expiry: '12/28',
          }
        ]
      };
      return NextResponse.json({ user: mockUser });
    }

    await connectDB();
    const user = await User.findById(decoded.id).populate('wishlist');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || '',
        wishlist: user.wishlist || [],
        addresses: user.addresses || [],
        savedPayments: user.savedPayments || [],
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
