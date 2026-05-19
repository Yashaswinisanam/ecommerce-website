import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json({ error: 'Bad Request: Missing rating or comment' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token) as { id: string; role: string; name?: string } | null;
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const name = decoded.name || 'Anonymous Member';

    if (!process.env.MONGODB_URI) {
      // Mock Offline Mode Recalculation Simulation
      const mockReview = {
        _id: Math.random().toString(36).substring(2, 10),
        user: decoded.id,
        name,
        rating,
        comment,
        helpfulCount: 0,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      
      return NextResponse.json({
        message: 'Review created successfully (Mock)',
        review: mockReview,
        averageRating: parseFloat(((4.8 + rating) / 2).toFixed(1)),
        totalReviews: 24,
        ratingBreakdown: [1, 1, 2, 4, 16]
      });
    }

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Relational Check: Verify if user purchased this product
    const verifiedOrder = await Order.findOne({
      user: decoded.id,
      'items.product': id
    });
    const isVerified = !!verifiedOrder;

    // Create the review object
    const newReview = {
      user: decoded.id,
      name,
      rating,
      comment,
      helpfulCount: 0,
      isVerified
    };

    product.reviews.unshift(newReview);

    // Recalculate metrics
    const totalReviews = product.reviews.length;
    const ratingBreakdown = [0, 0, 0, 0, 0];
    let sum = 0;

    interface ReviewDoc { rating: number; }
    product.reviews.forEach((r: ReviewDoc) => {
      sum += r.rating;
      const rateIdx = Math.floor(r.rating) - 1;
      if (rateIdx >= 0 && rateIdx < 5) {
        ratingBreakdown[rateIdx]++;
      }
    });

    product.averageRating = parseFloat((sum / totalReviews).toFixed(1));
    product.totalReviews = totalReviews;
    product.ratingBreakdown = ratingBreakdown;

    await product.save();

    return NextResponse.json({
      message: 'Review added successfully',
      review: product.reviews[0],
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      ratingBreakdown: product.ratingBreakdown
    }, { status: 201 });

  } catch (error) {
    console.error('Create Review Error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Bad Request: Missing reviewId' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ message: 'Marked as helpful (Mock)' });
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    review.helpfulCount += 1;
    await product.save();

    return NextResponse.json({ message: 'Review marked as helpful', helpfulCount: review.helpfulCount });

  } catch (error) {
    console.error('Update Review Error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
