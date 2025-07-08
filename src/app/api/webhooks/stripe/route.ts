import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { headers } from 'next/headers';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase'; // Ensure db is exported from your firebase config

// Initialize Stripe with the secret key from environment variables.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

// This is your Stripe webhook secret for verifying the request.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
    const body = await request.text();
    const signature = headers().get('stripe-signature') as string;

    let event: Stripe.Event;

    // Verify the event came from Stripe.
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const errorMessage = `Webhook Error: ${(err as Error).message}`;
        console.error(errorMessage);
        return new Response(errorMessage, { status: 400 });
    }
    
    // Handle the 'checkout.session.completed' event.
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // The client_reference_id was set to our internal user ID in the checkout session.
        const userId = session.client_reference_id;

        if (userId) {
            try {
                // This is the crucial part: Update the user's profile in your database.
                // This example assumes you have a 'user_profiles' collection where each document ID is the user's UID.
                const userDocRef = doc(db, "user_profiles", userId);
                await updateDoc(userDocRef, { 
                  subscriptionStatus: 'premium',
                  stripeCustomerId: session.customer, // Optional: save Stripe customer ID for future use
                  stripeSubscriptionId: session.subscription, // Optional: save subscription ID
                });
                
                console.log(`User ${userId} successfully upgraded to premium.`);

            } catch (dbError) {
                console.error("Error updating user status in Firestore:", dbError);
                // If the database update fails, return a 500 error. Stripe will retry the webhook.
                return new Response('Database update failed', { status: 500 });
            }
        } else {
             console.error("Webhook received without a client_reference_id (userId).");
        }
    }

    // Acknowledge receipt of the event.
    return NextResponse.json({ received: true });
}
