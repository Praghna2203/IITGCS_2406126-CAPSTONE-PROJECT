import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function MonthlyTrends() {
  const { state } = useApp();

  // Get last 6 months of data
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(date.toISOString().slice(0, 7));
  }

  const monthlyData = months.map(month => {
    // Only include individual transactions (not group transactions)
    const monthTransactions = state.transactions.filter(t => 
      t.date.startsWith(month) && !t.groupId
    );
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;
    
    return {
      month,
      income,
      expenses,
      savings
    };
  });

  const data = {
    labels: months.map(month => {
      const date = new Date(month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
      },
      {
        label: 'Net Savings',
        data: monthlyData.map(d => d.savings),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
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
        text: '6-Month Financial Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-800">Avg Monthly Income</h4>
          <p className="text-2xl font-semibold text-green-600">
            ${(monthlyData.reduce((sum, d) => sum + d.income, 0) / monthlyData.length).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-medium text-red-800">Avg Monthly Expenses</h4>
          <p className="text-2xl font-semibold text-red-600">
            ${(monthlyData.reduce((sum, d) => sum + d.expenses, 0) / monthlyData.length).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800">Avg Monthly Savings</h4>
          <p className="text-2xl font-semibold text-blue-600">
            ${(monthlyData.reduce((sum, d) => sum + d.savings, 0) / monthlyData.length).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}