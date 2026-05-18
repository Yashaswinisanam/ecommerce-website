import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI is missing. Returning mock data.');
      return NextResponse.json([
        {
          _id: '1',
          name: 'Premium Wireless Headphones',
          description: 'High-fidelity audio with active noise cancellation.',
          price: 299,
          category: 'Electronics',
          stock: 15,
          images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000', public_id: 'mock1' }]
        },
        {
          _id: '2',
          name: 'Minimalist Leather Watch',
          description: 'Timeless design with premium Italian leather strap.',
          price: 189,
          category: 'Accessories',
          stock: 24,
          images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000', public_id: 'mock2' }]
        },
        {
          _id: '3',
          name: 'Smart Home Speaker',
          description: 'Deep bass and immersive sound for any room.',
          price: 129,
          category: 'Electronics',
          stock: 8,
          images: [{ url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=1000', public_id: 'mock3' }]
        },
        {
          _id: '4',
          name: 'Ergonomic Office Chair',
          description: 'Maximum comfort for long working hours.',
          price: 450,
          category: 'Furniture',
          stock: 5,
          images: [{ url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000', public_id: 'mock4' }]
        }
      ]);
    }
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, category, stock, images } = body;

    if (!name || !description || !price || !category || !stock) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      images, // images should be an array of {url, public_id}
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
