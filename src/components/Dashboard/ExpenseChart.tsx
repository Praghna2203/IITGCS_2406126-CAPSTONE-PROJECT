import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useApp } from '../../contexts/AppContext';
import { getMonthlyTransactions, getCategoryColor } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function ExpenseChart() {
  const { state } = useApp();
  const [chartType, setChartType] = React.useState<'bar' | 'pie'>('bar');
  
  // Only include individual transactions (not group transactions)
  const monthlyTransactions = state.transactions.filter(t => 
    t.date.startsWith(state.selectedMonth) && !t.groupId
  );
  
  // Group expenses by category
  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const categories = Object.keys(expensesByCategory);
  const amounts = Object.values(expensesByCategory);
  const colors = categories.map(cat => getCategoryColor(state.categories, cat));

  const barData = {
    labels: categories,
    datasets: [
      {
        label: 'Expenses',
        data: amounts,
        backgroundColor: colors.map(color => color + '80'),
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
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
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No expense data available for this month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Expense Analysis</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'bar' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              chartType === 'pie' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pie
          </button>
        </div>
      </div>
      
      <div className="h-80">
        {chartType === 'bar' ? (
          <Bar data={barData} options={options} />
        ) : (
          <Pie data={pieData} options={options} />
        )}
      </div>
    </div>
  );
}