import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';

// This is your Stripe secret key.
// IMPORTANT: Keep this secret and load it from an environment variable.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
    const { userId, userEmail, userName } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ message: 'User information is required' }, { status: 400 });
    }
    
    // IMPORTANT: Replace this with the actual Price ID from your Stripe dashboard.
    // This ID represents the product and price for the premium subscription.
    const priceId = 'price_xxxxxxxxxxxxxx'; // e.g., price_1Pc3YJ...
    
    // This is the URL of your application.
    // In production, this should be your deployed app's URL.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    try {
        // Create a Checkout Session.
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ 
                price: priceId, 
                quantity: 1 
            }],
            mode: 'subscription', // Use 'subscription' for recurring payments.
            
            // Redirect URLs after payment.
            success_url: `${appUrl}/pengaturan/akun?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/pengaturan/akun?payment_canceled=true`,
            
            // Pre-fill the customer's email and pass user ID for webhook identification.
            customer_email: userEmail,
            client_reference_id: userId,
            // You can also pass metadata if needed.
            subscription_data: {
                metadata: {
                    userId: userId,
                    userName: userName,
                }
            }
        });

        // Return the session ID to the client.
        return NextResponse.json({ sessionId: session.id });

    } catch (error) {
        console.error("Error creating Stripe checkout session:", error);
        return NextResponse.json({ message: 'Error creating checkout session', error: (error as Error).message }, { status: 500 });
    }
}
