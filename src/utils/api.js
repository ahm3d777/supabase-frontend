import { supabase } from '../lib/supabase';

// Subscriptions
export const getSubscriptions = async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return { subscriptions: data };
};

export const getSubscription = async (id) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return { subscription: data };
};

export const createSubscription = async (subscriptionData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ ...subscriptionData, user_id: user.id }])
    .select()
    .single();
  
  if (error) throw error;
  return { subscription: data };
};

export const updateSubscription = async (id, subscriptionData) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .update(subscriptionData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return { subscription: data };
};

export const deleteSubscription = async (id) => {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return { message: 'Subscription deleted' };
};

export const importSubscriptions = async (subscriptions) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const subsWithUserId = subscriptions.map(sub => ({
    ...sub,
    user_id: user.id
  }));
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subsWithUserId)
    .select();
  
  if (error) throw error;
  return { subscriptions: data };
};

export const exportSubscriptions = async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*');
  
  if (error) throw error;
  
  // Convert to CSV
  const headers = ['Name', 'Cost', 'Billing Cycle', 'Category', 'Next Billing Date', 'Last Used', 'Status', 'Notes'];
  const csvContent = [
    headers.join(','),
    ...data.map(sub => [
      sub.name,
      sub.cost,
      sub.billing_cycle,
      sub.category,
      sub.next_billing_date,
      sub.last_used || '',
      sub.status,
      sub.notes || ''
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return blob;
};

// Analytics
export const getAnalyticsOverview = async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active');
  
  if (error) throw error;
  
  const subscriptions = data;
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const cost = parseFloat(sub.cost);
    if (sub.billing_cycle === 'monthly') return sum + cost;
    if (sub.billing_cycle === 'yearly') return sum + (cost / 12);
    return sum;
  }, 0);

  return {
    totalMonthly: totalMonthly.toFixed(2),
    totalYearly: (totalMonthly * 12).toFixed(2),
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length
  };
};

export const getSpendingByCategory = async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active');
  
  if (error) throw error;
  
  const categories = {};
  data.forEach(sub => {
    if (!categories[sub.category]) {
      categories[sub.category] = { total: 0, count: 0 };
    }
    categories[sub.category].total += parseFloat(sub.cost);
    categories[sub.category].count += 1;
  });
  
  const categoriesArray = Object.keys(categories).map(cat => ({
    category: cat,
    total: categories[cat].total,
    count: categories[cat].count
  }));
  
  return { categories: categoriesArray };
};

export const getDeadWeight = async () => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .or(`last_used.is.null,last_used.lt.${ninetyDaysAgo.toISOString()}`);
  
  if (error) throw error;
  return { deadWeight: data };
};

export const getSpendingTrends = async (months = 6) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());
  
  if (error) throw error;
  
  // Group by month
  const monthlyData = {};
  data.forEach(sub => {
    const month = new Date(sub.created_at).toISOString().slice(0, 7);
    if (!monthlyData[month]) monthlyData[month] = 0;
    monthlyData[month] += parseFloat(sub.cost);
  });
  
  const trends = Object.keys(monthlyData).map(month => ({
    month,
    total: monthlyData[month]
  }));
  
  return { trends };
};

export const getRecommendations = async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active');
  
  if (error) throw error;
  
  const recommendations = [];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  data.forEach(sub => {
    if (!sub.last_used || new Date(sub.last_used) < ninetyDaysAgo) {
      recommendations.push({
        type: 'unused',
        subscription: sub,
        message: `Consider canceling ${sub.name} - unused for 90+ days`
      });
    }
  });
  
  return { recommendations };
};

// User Settings
export const getUserSettings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserSettings = async (settings) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('user_settings')
    .update(settings)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (profile) => {
  const { error } = await supabase.auth.updateUser({
    data: profile
  });
  
  if (error) throw error;
  return { message: 'Profile updated' };
};

export const getUserStats = async () => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*');
  
  if (error) throw error;
  
  return {
    totalSubscriptions: data.length,
    activeSubscriptions: data.filter(s => s.status === 'active').length,
    totalSpent: data.reduce((sum, sub) => sum + parseFloat(sub.cost), 0)
  };
};
