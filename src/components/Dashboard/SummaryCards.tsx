import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, getMonthlyTransactions } from '../../utils/helpers';

export function SummaryCards() {
  const { state } = useApp();
  
  // Only include individual transactions (not group transactions)
  const monthlyTransactions = state.transactions.filter(t => 
    t.date.startsWith(state.selectedMonth) && !t.groupId
  );
  
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savings = totalIncome - totalExpenses;

  const cards = [
    {
      title: 'Total Income',
      amount: totalIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Expenses',
      amount: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Net Savings',
      amount: savings,
      icon: DollarSign,
      color: savings >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: savings >= 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-semibold ${card.color}`}>
                  {formatCurrency(card.amount)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}