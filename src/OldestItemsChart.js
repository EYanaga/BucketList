import React from 'react';
import './OldestItemsChart.css';

// A simple bar chart without external dependencies
function OldestItemsChart({ items }) {
  console.log('OldestItemsChart rendered', items);
  // Sort by createdAt ascending (oldest first)
  // Show all unaccomplished items, even if createdAt is missing
  const unaccomplished = items.filter(item => !item.completed);
  const now = new Date();
  const chartData = unaccomplished.map(item => {
    if (item.createdAt && item.createdAt.seconds) {
      const created = new Date(item.createdAt.seconds * 1000);
      const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      return { ...item, days, hasDate: true };
    } else {
      return { ...item, days: '?', hasDate: false };
    }
  });
  // Only use numeric days for max width
  const maxDays = Math.max(...chartData.filter(d => typeof d.days === 'number').map(d => d.days), 1);

  return (
    <div className="oldest-items-chart">
      <div className="oldest-chart-title">Longest Waiting Items</div>
      <div className="oldest-bars">
        {chartData.length === 0 ? (
          <div className="oldest-bar-row" style={{justifyContent: 'center', color: '#888', fontStyle: 'italic'}}>
            All caught up! No items waiting to be accomplished.
          </div>
        ) : (
          chartData.map((item, idx) => (
            <div key={item.id} className="oldest-bar-row">
              <span className="oldest-bar-label">{item.text}</span>
              <div className="oldest-bar-outer">
                <div
                  className="oldest-bar"
                  style={{ width: item.hasDate ? `${(item.days / maxDays) * 100}%` : '15%', background: '#ffb74d' }}
                  title={item.hasDate ? `${item.days} day${item.days !== 1 ? 's' : ''} on list` : 'Date unknown'}
                >
                  <span className="oldest-bar-days">{item.hasDate ? `${item.days}d` : '?'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OldestItemsChart;
