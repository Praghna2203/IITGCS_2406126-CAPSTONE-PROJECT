import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useApp } from '../../contexts/AppContext';
import { getCategoryColor, formatCurrency } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

export function CategoryBreakdown() {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState('thisMonth');

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'thisMonth':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case 'lastMonth':
        return { 
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1), 
          end: new Date(now.getFullYear(), now.getMonth(), 0) 
        };
      case 'last3Months':
        return { 
          start: new Date(now.getFullYear(), now.getMonth() - 3, 1), 
          end: now 
        };
      case 'thisYear':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: new Date(0), end: now };
    }
  };

  const { start, end } = getDateRange();
  // Only include individual transactions (not group transactions)
  const filteredTransactions = state.transactions.filter(t => {
    if (t.groupId) return false;
    const date = new Date(t.date);
    return date >= start && date <= end && t.type === 'expense';
  });

  const categoryData = filteredTransactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.keys(categoryData);
  const amounts = Object.values(categoryData);
  const colors = categories.map(cat => getCategoryColor(state.categories, cat));

  const data = {
    labels: categories,
    datasets: [
      {
        data: amounts,
        backgroundColor: colors.map(color => color + '80'),
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
  };

  const totalExpenses = amounts.reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="last3Months">Last 3 Months</option>
          <option value="thisYear">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No expense data available for the selected period</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <Pie data={data} options={options} />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Category Details</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories
                .map((category, index) => ({
                  category,
                  amount: amounts[index],
                  percentage: (amounts[index] / totalExpenses) * 100,
                  color: colors[index]
                }))
                .sort((a, b) => b.amount - a.amount)
                .map(({ category, amount, percentage, color }) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(amount)}</p>
                      <p className="text-sm text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Expenses</span>
                <span className="font-semibold text-gray-900">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}