import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('No userId found in auth');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching subscription status for userId:', userId);

    // Get user data from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('credits, subscription_status')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      console.log('Supabase error:', error);
      
      if (error.code === 'PGRST116') { // Not found error
        console.log('User not found, creating new user');
        // Create a new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            clerk_id: userId,
            credits: 0,
            subscription_status: 'inactive'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating new user:', insertError);
          return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
          );
        }

        console.log('Created new user:', newUser);
        return NextResponse.json({
          subscriptionStatus: 'inactive',
          credits: 0
        });
      }

      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('No user data found');
      return NextResponse.json({
        subscriptionStatus: 'inactive',
        credits: 0
      });
    }
    
    console.log('Found user data:', user);
    return NextResponse.json({
      subscriptionStatus: user.subscription_status || 'inactive',
      credits: user.credits || 0
    });
  } catch (error: any) {
    console.error('Error in subscription status check:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 