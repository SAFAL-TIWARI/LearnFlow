// Clear LearnFlow Analytics Cache and Force Real Data
// Run this in browser console to force refresh analytics data

console.log('🧹 Clearing LearnFlow Analytics Cache...');

// Clear all analytics-related localStorage items
const keysToRemove = [
  'learnflow_analytics_cache',
  'learnflow_analytics_last_fetch',
  'learnflow_live_stats_cache'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  } else {
    console.log(`ℹ️  Not found: ${key}`);
  }
});

console.log('🔄 Cache cleared! Testing API...');
console.log('');

// Test the API endpoints and show expected data
fetch('/api/analytics/google-analytics')
  .then(response => response.json())
  .then(data => {
    console.log('📊 Current API Data (30-day period):');
    console.log('Google Analytics API Response:', data);
    if (data.success) {
      console.log(`👥 Active Users: ${data.data.activeUsers} (should be ~2)`);
      console.log(`📈 Total Users: ${data.data.totalUsers} (should be ~140)`);
      console.log(`👀 Page Views: ${data.data.pageViews} (should be ~1,287)`);
      console.log(`🎯 Sessions: ${data.data.sessions} (should be ~156)`);
      console.log(`📉 Bounce Rate: ${Math.round(data.data.bounceRate * 100)}% (should be ~23%)`);
    }

    console.log('');
    console.log('🎯 Expected Website Display:');
    console.log('• Hero Badge: "140+ Students Already Learning"');
    console.log('• Hero Stats: "2+ Online Now"');
    console.log('• Statistics Section:');
    console.log('  - Active Students: 140+');
    console.log('  - Study Resources: 2,500+');
    console.log('  - Downloads: 1,287+');
    console.log('  - Success Rate: 98%');

    console.log('');
    console.log('🚀 Next Steps:');
    console.log('1. Refresh the page (F5 or Ctrl+R)');
    console.log('2. Wait 2-3 seconds for data to load');
    console.log('3. Check if numbers match your GA dashboard');
    console.log('4. If still showing old data, run this script again');

    // Auto-refresh the page after 2 seconds
    setTimeout(() => {
      console.log('🔄 Auto-refreshing page...');
      window.location.reload();
    }, 2000);
  })
  .catch(error => {
    console.error('❌ Error fetching GA data:', error);
    console.log('🔄 Refreshing page anyway...');
    setTimeout(() => window.location.reload(), 2000);
  });
