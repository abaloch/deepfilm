import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      console.log('No userId found in auth');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching subscription status for userId:', userId);

    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      return NextResponse.json({
        subscriptionStatus: 'inactive',
        credits: 0
      });
    }

    // Get user's email from Clerk
    const email = user?.emailAddresses[0]?.emailAddress;
    
    if (!email) {
      console.error('No email found for user');
      return NextResponse.json({
        subscriptionStatus: 'inactive',
        credits: 0
      });
    }

    // First try to find user by clerk_id
    const { data: existingUser, error: clerkIdError } = await supabaseAdmin
      .from('users')
      .select('credits, subscription_status, stripe_customer_id, stripe_subscription_id')
      .eq('clerk_id', userId)
      .single();

    if (clerkIdError && clerkIdError.code === 'PGRST116') {
      // If not found by clerk_id, try to find by email
      const { data: emailUser, error: emailError } = await supabaseAdmin
        .from('users')
        .select('credits, subscription_status, stripe_customer_id, stripe_subscription_id')
        .eq('email', email)
        .single();

      if (emailError && emailError.code === 'PGRST116') {
        // No user found with either clerk_id or email, create new user
        console.log('Creating new user');
        const { data: newUser, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            clerk_id: userId,
            email: email,
            credits: 0,
            subscription_status: 'inactive'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating new user:', insertError);
          return NextResponse.json({
            subscriptionStatus: 'inactive',
            credits: 0
          });
        }

        console.log('Created new user:', newUser);
        return NextResponse.json({
          subscriptionStatus: 'inactive',
          credits: 0
        });
      } else if (emailError) {
        console.error('Error finding user by email:', emailError);
        return NextResponse.json({
          subscriptionStatus: 'inactive',
          credits: 0
        });
      } else if (emailUser) {
        // Found user by email, update their clerk_id
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ clerk_id: userId })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating user clerk_id:', updateError);
        }

        // Verify subscription status with Stripe
        if (emailUser.stripe_customer_id) {
          try {
            const subscriptions = await stripe.subscriptions.list({
              customer: emailUser.stripe_customer_id,
              status: 'active',
              limit: 1
            });

            if (subscriptions.data.length === 0) {
              // If no active subscription in Stripe, update our database
              await supabaseAdmin
                .from('users')
                .update({ subscription_status: 'inactive' })
                .eq('email', email);
              
              return NextResponse.json({
                subscriptionStatus: 'inactive',
                credits: emailUser.credits || 0,
                stripeCustomerId: emailUser.stripe_customer_id,
                stripeSubscriptionId: emailUser.stripe_subscription_id
              });
            }
          } catch (error) {
            console.error('Error verifying subscription with Stripe:', error);
          }
        }

        return NextResponse.json({
          subscriptionStatus: emailUser.subscription_status || 'inactive',
          credits: emailUser.credits || 0,
          stripeCustomerId: emailUser.stripe_customer_id,
          stripeSubscriptionId: emailUser.stripe_subscription_id
        });
      }
    } else if (clerkIdError) {
      console.error('Error finding user by clerk_id:', clerkIdError);
      return NextResponse.json({
        subscriptionStatus: 'inactive',
        credits: 0
      });
    }

    if (!existingUser) {
      console.log('No user data found');
      return NextResponse.json({
        subscriptionStatus: 'inactive',
        credits: 0
      });
    }

    // Verify subscription status with Stripe
    if (existingUser.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: existingUser.stripe_customer_id,
          status: 'active',
          limit: 1
        });

        if (subscriptions.data.length === 0) {
          // If no active subscription in Stripe, update our database
          await supabaseAdmin
            .from('users')
            .update({ subscription_status: 'inactive' })
            .eq('clerk_id', userId);
          
          return NextResponse.json({
            subscriptionStatus: 'inactive',
            credits: existingUser.credits || 0,
            stripeCustomerId: existingUser.stripe_customer_id,
            stripeSubscriptionId: existingUser.stripe_subscription_id
          });
        }
      } catch (error) {
        console.error('Error verifying subscription with Stripe:', error);
      }
    }
    
    console.log('Found user data:', existingUser);
    return NextResponse.json({
      subscriptionStatus: existingUser.subscription_status || 'inactive',
      credits: existingUser.credits || 0,
      stripeCustomerId: existingUser.stripe_customer_id,
      stripeSubscriptionId: existingUser.stripe_subscription_id
    });
  } catch (error: any) {
    console.error('Error in subscription status check:', error);
    return NextResponse.json({
      subscriptionStatus: 'inactive',
      credits: 0
    });
  }
} 