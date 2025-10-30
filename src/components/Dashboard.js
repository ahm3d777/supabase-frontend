import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSubscriptions, getAnalyticsOverview } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, subsData] = await Promise.all([
        getAnalyticsOverview(),
        getSubscriptions()
      ]);
      setStats(statsData);
      setSubscriptions(subsData.subscriptions.slice(0, 5)); // Latest 5
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div className="skeleton" style={{ width: '200px', height: '32px' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '40px' }}></div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: '100%', height: '120px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const upcomingRenewals = subscriptions
    .filter(sub => {
      const daysUntil = Math.ceil((new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil > 0;
    })
    .sort((a, b) => new Date(a.next_billing_date) - new Date(b.next_billing_date));

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's your subscription overview.</p>
        </div>
        <Link to="/subscriptions/new" className="btn btn-primary">
          <span>+</span> Add Subscription
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-label">Active Subscriptions</div>
            <div className="stat-value">{stats?.activeSubscriptions || 0}</div>
            <div className="stat-change positive">
              <span>↑ 2 this month</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Monthly Spend</div>
            <div className="stat-value">${stats?.totalMonthly || '0.00'}</div>
            <div className="stat-change">
              <span className="text-secondary">Per month</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-label">Yearly Spend</div>
            <div className="stat-value">${stats?.totalYearly || '0.00'}</div>
            <div className="stat-change">
              <span className="text-secondary">Per year</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-label">Avg per Sub</div>
            <div className="stat-value">
              ${stats?.activeSubscriptions ? 
                (parseFloat(stats.totalMonthly) / stats.activeSubscriptions).toFixed(2) : 
                '0.00'}
            </div>
            <div className="stat-change">
              <span className="text-secondary">Monthly average</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      {upcomingRenewals.length > 0 && (
        <div className="insight-card insight-warning">
          <div className="insight-icon">⏰</div>
          <div className="insight-content">
            <div className="insight-title">Upcoming Renewals</div>
            <div className="insight-text">
              You have {upcomingRenewals.length} subscription{upcomingRenewals.length > 1 ? 's' : ''} renewing in the next 30 days
            </div>
          </div>
          <Link to="/subscriptions" className="btn btn-sm btn-ghost">View All</Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Subscriptions */}
        <div className="card">
          <div className="card-header-flex">
            <h3>Recent Subscriptions</h3>
            <Link to="/subscriptions" className="btn btn-sm btn-ghost">View All →</Link>
          </div>
          
          {subscriptions.length === 0 ? (
            <div className="empty-state-compact">
              <div className="empty-icon">📭</div>
              <p>No subscriptions yet</p>
              <Link to="/subscriptions/new" className="btn btn-sm btn-primary">Add Your First</Link>
            </div>
          ) : (
            <div className="subscription-list">
              {subscriptions.map(sub => (
                <Link key={sub.id} to={`/subscriptions/${sub.id}`} className="subscription-item">
                  <div className="sub-icon">{getCategoryIcon(sub.category)}</div>
                  <div className="sub-info">
                    <div className="sub-name">{sub.name}</div>
                    <div className="sub-category">{sub.category}</div>
                  </div>
                  <div className="sub-amount">${parseFloat(sub.cost).toFixed(2)}</div>
                  <div className="sub-badge">
                    <span className={`badge badge-${sub.billing_cycle === 'monthly' ? 'primary' : 'warning'}`}>
                      {sub.billing_cycle}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/subscriptions/new" className="action-card">
              <div className="action-icon">➕</div>
              <div className="action-label">Add Subscription</div>
            </Link>
            <Link to="/analytics" className="action-card">
              <div className="action-icon">📊</div>
              <div className="action-label">View Analytics</div>
            </Link>
            <Link to="/settings" className="action-card">
              <div className="action-icon">⚙️</div>
              <div className="action-label">Settings</div>
            </Link>
            <button className="action-card" onClick={() => toast.info('Export feature coming soon!')}>
              <div className="action-icon">📤</div>
              <div className="action-label">Export Data</div>
            </button>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <div className="tip-title">Pro Tip</div>
            <div className="tip-text">
              Review your subscriptions monthly to identify services you no longer use. This can save you hundreds per year!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    'Entertainment': '🎬',
    'Software': '💻',
    'Music': '🎵',
    'Gaming': '🎮',
    'Fitness': '💪',
    'Education': '📚',
    'Productivity': '⚡',
    'Cloud Storage': '☁️',
    'News': '📰',
    'Other': '📦'
  };
  return icons[category] || '📦';
};

export default Dashboard;
