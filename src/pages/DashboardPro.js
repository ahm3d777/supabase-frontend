import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptions, getAnalyticsOverview } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { Loading, EmptyState, Button, StatCard, Card, Badge } from '../components/UI';
import { formatCurrency, formatRelativeTime, daysUntilRenewal, getUrgencyLevel, categoryConfig } from '../utils/theme';

export default function DashboardPro() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, analyticsData] = await Promise.all([
        getSubscriptions(),
        getAnalyticsOverview()
      ]);
      setSubscriptions(subsData.subscriptions || []);
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || sub.category === filter;
    return matchesSearch && matchesFilter;
  });

  const upcomingRenewals = subscriptions
    .filter(sub => sub.status === 'active')
    .map(sub => ({
      ...sub,
      daysUntil: daysUntilRenewal(sub.next_billing_date),
      urgency: getUrgencyLevel(daysUntilRenewal(sub.next_billing_date))
    }))
    .filter(sub => sub.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const categories = [...new Set(subscriptions.map(sub => sub.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="xl" text="Loading your subscriptions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's your subscription overview</p>
            </div>
            <Button 
              onClick={() => navigate('/subscriptions/new')}
              icon="+"
              size="lg"
            >
              Add Subscription
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon="💰"
              label="Monthly Spend"
              value={formatCurrency(analytics.totalMonthly)}
              trend="up"
              trendValue="+12% from last month"
            />
            <StatCard
              icon="📅"
              label="Yearly Spend"
              value={formatCurrency(analytics.totalYearly)}
            />
            <StatCard
              icon="📊"
              label="Active Subscriptions"
              value={analytics.activeSubscriptions}
            />
            <StatCard
              icon="🎯"
              label="Total Services"
              value={analytics.totalSubscriptions}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscriptions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Subscriptions */}
            {filteredSubscriptions.length === 0 ? (
              <Card className="p-12">
                <EmptyState
                  icon="📦"
                  title="No subscriptions found"
                  description={searchTerm ? "Try adjusting your search or filters" : "Start tracking your subscriptions by adding your first one!"}
                  action={
                    !searchTerm && (
                      <Button onClick={() => navigate('/subscriptions/new')}>
                        Add Your First Subscription
                      </Button>
                    )
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSubscriptions.map(sub => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onClick={() => navigate(`/subscriptions/${sub.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Renewals */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔔</span>
                Upcoming Renewals
              </h3>
              {upcomingRenewals.length === 0 ? (
                <p className="text-gray-500 text-sm">No renewals in the next 30 days</p>
              ) : (
                <div className="space-y-3">
                  {upcomingRenewals.map(sub => (
                    <div
                      key={sub.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{sub.name}</span>
                        <UrgencyBadge urgency={sub.urgency} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatRelativeTime(sub.next_billing_date)}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(sub.cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => navigate('/subscriptions')}
                >
                  View All Subscriptions
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => navigate('/analytics')}
                >
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscription Card Component
const SubscriptionCard = ({ subscription, onClick }) => {
  const config = categoryConfig[subscription.category] || categoryConfig['Other'];
  const daysUntil = daysUntilRenewal(subscription.next_billing_date);
  const urgency = getUrgencyLevel(daysUntil);

  return (
    <Card hover onClick={onClick} className="p-6 relative overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-10 rounded-bl-full`}></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
              <p className="text-sm text-gray-500">{subscription.category}</p>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="mb-4">
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(subscription.cost)}</p>
          <p className="text-sm text-gray-500">per {subscription.billing_cycle}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📅</span>
            <span>{formatRelativeTime(subscription.next_billing_date)}</span>
          </div>
          <UrgencyBadge urgency={urgency} />
        </div>
      </div>
    </Card>
  );
};

// Urgency Badge Component
const UrgencyBadge = ({ urgency }) => {
  const config = {
    overdue: { variant: 'danger', text: 'Overdue' },
    urgent: { variant: 'danger', text: 'Due Soon' },
    soon: { variant: 'warning', text: 'Upcoming' },
    upcoming: { variant: 'primary', text: 'Scheduled' },
    later: { variant: 'default', text: 'Later' },
  };

  const { variant, text } = config[urgency] || config.later;

  return <Badge variant={variant} size="sm">{text}</Badge>;
};
