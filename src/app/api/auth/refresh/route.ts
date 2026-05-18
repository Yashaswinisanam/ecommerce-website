import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    if (!process.env.MONGODB_URI) {
       // Demo Mode Fallback
       const payload = verifyRefreshToken(refreshToken) as { id: string; role: string } | null;
       if (!payload) {
         return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
       }
       const newAccessToken = signAccessToken({ id: payload.id, role: payload.role });
       return NextResponse.json({ accessToken: newAccessToken });
     }
 
     await connectDB();
     const payload = verifyRefreshToken(refreshToken) as { id: string; role: string } | null;
     if (!payload) {
       return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
     }
 
     const user = await User.findById(payload.id).select('+refreshToken');
     if (!user || user.refreshToken !== refreshToken) {
       return NextResponse.json({ error: 'Token mismatch' }, { status: 401 });
     }
 
     // Generate new tokens
     const newAccessToken = signAccessToken({ id: user._id, role: user.role });
     const newRefreshToken = signRefreshToken({ id: user._id, role: user.role });
 
     // Update refresh token in DB
     user.refreshToken = newRefreshToken;
     await user.save();
 
     const response = NextResponse.json({ accessToken: newAccessToken });
 
     // Set new refresh token in cookie
     response.cookies.set('refreshToken', newRefreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       maxAge: 7 * 24 * 60 * 60,
       path: '/',
     });
 
     // Set new access token in cookie
     response.cookies.set('accessToken', newAccessToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       maxAge: 15 * 60,
       path: '/',
     });
 
     return response;
   } catch {
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
   }
}
