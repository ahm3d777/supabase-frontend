// Theme and formatting utilities

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInDays = Math.floor((targetDate - now) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays === -1) return 'Yesterday';
  if (diffInDays > 1 && diffInDays <= 7) return `In ${diffInDays} days`;
  if (diffInDays < -1 && diffInDays >= -7) return `${Math.abs(diffInDays)} days ago`;
  
  return targetDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Calculate days until renewal
export const daysUntilRenewal = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  return Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
};

// Get urgency level for renewals
export const getUrgencyLevel = (daysUntil) => {
  if (daysUntil <= 0) return 'overdue';
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 30) return 'warning';
  return 'normal';
};

// Category configuration with icons and colors
export const categoryConfig = {
  'Entertainment': {
    icon: '🎬',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  'Software': {
    icon: '💻',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  'Music': {
    icon: '🎵',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  'Gaming': {
    icon: '🎮',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  'Fitness': {
    icon: '💪',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  'Education': {
    icon: '📚',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
  },
  'Productivity': {
    icon: '⚡',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
  },
  'Cloud Storage': {
    icon: '☁️',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
  },
  'News': {
    icon: '📰',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.1)',
  },
  'Other': {
    icon: '📦',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
  },
};

// Get category config
export const getCategoryConfig = (category) => {
  return categoryConfig[category] || categoryConfig['Other'];
};

// Format billing cycle
export const formatBillingCycle = (cycle) => {
  const cycles = {
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'quarterly': 'Quarterly',
    'weekly': 'Weekly',
  };
  return cycles[cycle] || cycle;
};

// Calculate monthly cost
export const calculateMonthlyCost = (cost, billingCycle) => {
  const amount = parseFloat(cost);
  switch (billingCycle) {
    case 'weekly':
      return amount * 4.33; // Average weeks per month
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
    default:
      return amount;
  }
};

// Calculate yearly cost
export const calculateYearlyCost = (cost, billingCycle) => {
  return calculateMonthlyCost(cost, billingCycle) * 12;
};

// Status badge colors
export const getStatusColor = (status) => {
  const colors = {
    'active': { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
    'inactive': { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280' },
    'cancelled': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    'paused': { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
  };
  return colors[status] || colors['active'];
};

// Truncate text
export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Format date
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-US');
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Generate random color for avatar
export const getAvatarColor = (name) => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a56 0%, #ff6a00 100%)',
  ];
  
  if (!name) return colors[0];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Class names helper
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
