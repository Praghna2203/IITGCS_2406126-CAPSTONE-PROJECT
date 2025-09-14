import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { calculateBudgetSpent, formatCurrency } from '../../utils/helpers';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function BudgetOverview() {
  const { state } = useApp();
  
  const currentBudgets = state.budgets.filter(b => b.month === state.selectedMonth);
  
  const budgetData = currentBudgets.map(budget => {
    const spent = calculateBudgetSpent(state.transactions, budget.category, state.selectedMonth);
    const remaining = budget.limit - spent;
    const percentage = (spent / budget.limit) * 100;
    
    return {
      ...budget,
      spent,
      remaining,
      percentage: Math.min(percentage, 100)
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
      
      {budgetData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No budgets set for this month</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgetData.map(budget => (
            <div key={budget.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                <div className="flex items-center space-x-1">
                  {budget.percentage > 100 ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : budget.percentage > 80 ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budget.percentage > 100 
                      ? 'bg-red-500' 
                      : budget.percentage > 80 
                      ? 'bg-amber-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>{formatCurrency(budget.spent)} spent</span>
                <span>
                  {budget.remaining >= 0 
                    ? `${formatCurrency(budget.remaining)} left`
                    : `${formatCurrency(Math.abs(budget.remaining))} over`
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}