import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency, calculateBudgetSpent } from '../../utils/helpers';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export function SpendingInsights() {
  const { state } = useApp();

  // Current month analysis
  const currentMonth = new Date().toISOString().slice(0, 7);
  // Only include individual transactions (not group transactions)
  const currentTransactions = state.transactions.filter(t => 
    t.date.startsWith(currentMonth) && !t.groupId
  );
  const currentIncome = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const currentExpenses = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Previous month comparison
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  // Only include individual transactions (not group transactions)
  const previousTransactions = state.transactions.filter(t => 
    t.date.startsWith(previousMonth) && !t.groupId
  );
  const previousExpenses = previousTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const expenseChange = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;

  // Budget analysis
  const currentBudgets = state.budgets.filter(b => b.month === currentMonth);
  const budgetAnalysis = currentBudgets.map(budget => {
    const spent = calculateBudgetSpent(state.transactions, budget.category, currentMonth);
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    return {
      ...budget,
      spent,
      percentage,
      status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
    };
  });

  const overBudgetCount = budgetAnalysis.filter(b => b.status === 'over').length;
  const warningBudgetCount = budgetAnalysis.filter(b => b.status === 'warning').length;

  // Category insights
  const categorySpending = currentTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const insights = [
    {
      title: 'Monthly Spending Trend',
      value: expenseChange >= 0 ? `+${expenseChange.toFixed(1)}%` : `${expenseChange.toFixed(1)}%`,
      description: `compared to last month`,
      icon: expenseChange >= 0 ? TrendingUp : TrendingDown,
      color: expenseChange >= 0 ? 'text-red-600' : 'text-green-600',
      bgColor: expenseChange >= 0 ? 'bg-red-50' : 'bg-green-50'
    },
    {
      title: 'Savings Rate',
      value: currentIncome > 0 ? `${(((currentIncome - currentExpenses) / currentIncome) * 100).toFixed(1)}%` : '0%',
      description: 'of income saved this month',
      icon: currentIncome > currentExpenses ? TrendingUp : TrendingDown,
      color: currentIncome > currentExpenses ? 'text-green-600' : 'text-red-600',
      bgColor: currentIncome > currentExpenses ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Budget Status',
      value: overBudgetCount > 0 ? `${overBudgetCount} over` : warningBudgetCount > 0 ? `${warningBudgetCount} warning` : 'All good',
      description: 'budget categories',
      icon: overBudgetCount > 0 ? AlertTriangle : warningBudgetCount > 0 ? AlertTriangle : CheckCircle,
      color: overBudgetCount > 0 ? 'text-red-600' : warningBudgetCount > 0 ? 'text-amber-600' : 'text-green-600',
      bgColor: overBudgetCount > 0 ? 'bg-red-50' : warningBudgetCount > 0 ? 'bg-amber-50' : 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Financial Insights</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${insight.bgColor}`}>
                  <Icon className={`h-6 w-6 ${insight.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{insight.title}</p>
                  <p className={`text-2xl font-semibold ${insight.color}`}>
                    {insight.value}
                  </p>
                  <p className="text-sm text-gray-500">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Top Spending Categories</h4>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-gray-500">No spending data available</p>
            ) : (
              topCategories.map(([category, amount], index) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{category}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Budget Performance</h4>
          <div className="space-y-3">
            {budgetAnalysis.length === 0 ? (
              <p className="text-gray-500">No budgets set for this month</p>
            ) : (
              budgetAnalysis
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 5)
                .map(budget => (
                  <div key={budget.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {budget.status === 'over' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : budget.status === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium text-gray-900">{budget.category}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${
                        budget.status === 'over' 
                          ? 'text-red-600' 
                          : budget.status === 'warning' 
                          ? 'text-amber-600' 
                          : 'text-green-600'
                      }`}>
                        {budget.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Smart Recommendations</h4>
        <div className="space-y-2 text-sm text-blue-800">
          {overBudgetCount > 0 && (
            <p>• You have {overBudgetCount} categories over budget. Consider reducing spending or adjusting your budget limits.</p>
          )}
          {currentIncome > 0 && (currentExpenses / currentIncome) > 0.8 && (
            <p>• You're spending {((currentExpenses / currentIncome) * 100).toFixed(0)}% of your income. Consider increasing your savings rate.</p>
          )}
          {topCategories.length > 0 && (
            <p>• Your top spending category is {topCategories[0][0]} at {formatCurrency(topCategories[0][1])}. Look for ways to optimize these expenses.</p>
          )}
          {expenseChange > 20 && (
            <p>• Your spending increased by {expenseChange.toFixed(1)}% this month. Review your recent transactions for any unusual expenses.</p>
          )}
        </div>
      </div>
    </div>
  );
}