import { NextResponse } from 'next/server';
import { getMergedPosts } from '@/lib/community-posts';

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  try {
    const posts = await getMergedPosts(params.locale);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}