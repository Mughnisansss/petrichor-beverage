// This API route has been disabled as Stripe functionality was removed.
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ message: 'Feature disabled' }, { status: 404 });
}
