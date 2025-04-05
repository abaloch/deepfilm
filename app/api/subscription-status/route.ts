import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    
    console.log('Checking subscription status for userId:', userId);
    
    if (!userId) {
      console.log('No userId found, returning unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId);

    console.log('Supabase query result:', {
      userId,
      users,
      error,
      query: `SELECT * FROM users WHERE clerk_id = '${userId}'`
    });

    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // If no user found, create a new user with default values
    if (!users || users.length === 0) {
      console.log('No user found in database for userId:', userId);
      
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

    const user = users[0];
    console.log('Found user in database:', user);
    
    return NextResponse.json({
      subscriptionStatus: user.subscription_status || 'inactive',
      credits: user.credits || 0
    });
  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 