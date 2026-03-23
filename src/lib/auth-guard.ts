/**
 * Server-side auth guard utilities for API routes.
 * Provides reusable session validation helpers.
 */
import { auth } from './auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Get current session in API routes and server components.
 * Returns the session object or null if not authenticated.
 */
export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Require authentication for API routes.
 * Returns 401 JSON response if not authenticated.
 * Returns the session if authenticated.
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}

/**
 * Require admin role for API routes.
 * Returns 401 if not authenticated, 403 if not admin.
 * Returns the session if user is an admin.
 */
export async function requireAdmin() {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (session!.user.role !== 'admin') {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }
  return { session, error: null };
}
