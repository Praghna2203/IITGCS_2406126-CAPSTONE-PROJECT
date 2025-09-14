import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { SummaryCards } from './SummaryCards';
import { ExpenseChart } from './ExpenseChart';
import { BudgetOverview } from './BudgetOverview';
import { RecentTransactions } from './RecentTransactions';
import { MonthSelector } from './MonthSelector';

export function Dashboard() {
    const { state } = useApp();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                <MonthSelector />
            </div>

            <SummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ExpenseChart />
                </div>
                <div>
                    <BudgetOverview />
                </div>
            </div>

            <RecentTransactions />
        </div>
    );
}