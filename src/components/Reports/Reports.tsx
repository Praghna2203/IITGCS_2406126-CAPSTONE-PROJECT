import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MonthlyTrends } from './MonthlyTrends';
import { CategoryBreakdown } from './CategoryBreakdown';
import { SpendingInsights } from './SpendingInsights';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

export function Reports() {
  const [activeTab, setActiveTab] = useState('trends');

  const tabs = [
    { id: 'trends', label: 'Monthly Trends', icon: TrendingUp },
    { id: 'categories', label: 'Category Breakdown', icon: PieChart },
    { id: 'insights', label: 'Spending Insights', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'trends' && <MonthlyTrends />}
          {activeTab === 'categories' && <CategoryBreakdown />}
          {activeTab === 'insights' && <SpendingInsights />}
        </div>
      </div>
    </div>
  );
}