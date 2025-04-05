import { supabase } from '@/lib/supabase';

export const CREDITS_PER_MONTH = {
  basic: 6
} as const;

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';

export async function initializeUserCredits(
  clerkId: string,
  email: string,
  plan: keyof typeof CREDITS_PER_MONTH,
  subscriptionId: string,
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' = 'active'
) {
  console.log('Initializing credits with params:', {
    clerkId,
    email,
    plan,
    subscriptionId,
    status
  });

  const credits = CREDITS_PER_MONTH[plan];
  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

  try {
    // Check if user already exists
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId);

    console.log('Existing user check:', {
      exists: users && users.length > 0,
      error: fetchError
    });

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      throw new Error('Failed to check existing user');
    }

    if (users && users.length > 0) {
      const existingUser = users[0];
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          credits: existingUser.credits + credits,
          subscription_status: status,
          subscription_id: subscriptionId,
          subscription_end_date: subscriptionEndDate.toISOString()
        })
        .eq('clerk_id', clerkId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw new Error('Failed to update user credits');
      }

      console.log('User updated successfully:', updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          email,
          credits,
          subscription_status: status,
          subscription_id: subscriptionId,
          subscription_end_date: subscriptionEndDate.toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        throw new Error('Failed to create user');
      }

      console.log('New user created successfully:', newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error in initializeUserCredits:', error);
    throw error;
  }
}

export async function updateSubscriptionStatus(
  clerkId: string,
  status: SubscriptionStatus,
  subscriptionId?: string
) {
  const updateData: any = {
    subscription_status: status
  };

  if (subscriptionId) {
    updateData.subscription_id = subscriptionId;
  }

  if (status === 'canceled' || status === 'inactive') {
    updateData.subscription_end_date = new Date().toISOString();
  }

  const { data: updatedUser } = await supabase
    .from('users')
    .update(updateData)
    .eq('clerk_id', clerkId)
    .select()
    .single();

  return updatedUser;
}

export async function useCredits(clerkId: string, amount: number = 1) {
  try {
    console.log('Using credits:', { clerkId, amount });

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('credits, subscription_status')
      .eq('clerk_id', clerkId)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      if (fetchError.code === 'PGRST116') { // Not found error
        throw new Error('Please subscribe to generate videos');
      }
      throw new Error('Failed to fetch user information. Please try again later.');
    }

    if (!user) {
      throw new Error('Please subscribe to generate videos');
    }

    if (user.credits < amount) {
      throw new Error('Insufficient credits. Please upgrade your subscription to generate more videos.');
    }

    if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
      throw new Error('Your subscription is not active. Please check your subscription status.');
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ credits: user.credits - amount })
      .eq('clerk_id', clerkId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating credits:', updateError);
      throw new Error('Failed to update credits. Please try again later.');
    }

    console.log('Credits updated successfully:', updatedUser);
    return updatedUser;
  } catch (error: any) {
    console.error('Error in useCredits:', error);
    throw error;
  }
}

export async function getRemainingCredits(clerkId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('credits, subscription_status')
    .eq('clerk_id', clerkId)
    .single();

  return {
    credits: user?.credits ?? 0,
    subscriptionStatus: user?.subscription_status ?? 'inactive'
  };
}

export async function addCredits(clerkId: string, amount: number) {
  const { data: user } = await supabase
    .from('users')
    .select('credits')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const { data: updatedUser } = await supabase
    .from('users')
    .update({ credits: user.credits + amount })
    .eq('clerk_id', clerkId)
    .select()
    .single();

  return updatedUser;
}

export async function canGenerateVideo(clerkId: string): Promise<{ canGenerate: boolean; message?: string }> {
  const { data: user } = await supabase
    .from('users')
    .select('credits, subscription_status')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) {
    return { canGenerate: false, message: 'User not found' };
  }

  if (user.credits < 1) {
    return { canGenerate: false, message: 'Insufficient credits. Please upgrade your subscription to generate more videos.' };
  }

  if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
    return { canGenerate: false, message: 'Your subscription is not active. Please check your subscription status.' };
  }

  return { canGenerate: true };
} 