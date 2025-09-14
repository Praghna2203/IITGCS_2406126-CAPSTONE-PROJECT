import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BudgetForm } from './BudgetForm';
import { calculateBudgetSpent, formatCurrency } from '../../utils/helpers';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Budget } from '../../types';

export function BudgetList() {
    const { state, dispatch } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const currentBudgets = state.budgets.filter(b => b.month === state.selectedMonth);

    const budgetData = currentBudgets.map(budget => {
        const spent = calculateBudgetSpent(state.transactions, budget.category, state.selectedMonth);
        const remaining = budget.limit - spent;
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return {
            ...budget,
            spent,
            remaining,
            percentage: Math.min(percentage, 100)
        };
    });

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            dispatch({ type: 'DELETE_BUDGET', payload: id });
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingBudget(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Budget Management</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Budget</span>
                </button>
            </div>

            {budgetData.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">No budgets set for this month</p>
                    <p className="text-gray-400 text-sm">Create budgets to track your spending by category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgetData.map(budget => (
                        <div key={budget.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(budget)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(budget.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Budget</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatCurrency(budget.limit)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Spent</span>
                                    <span className={`font-semibold ${budget.spent > budget.limit ? 'text-red-600' : 'text-gray-900'
                                        }`}>
                                        {formatCurrency(budget.spent)}
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${budget.percentage > 100
                                                ? 'bg-red-500'
                                                : budget.percentage > 80
                                                    ? 'bg-amber-500'
                                                    : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-1">
                                        {budget.percentage > 100 ? (
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                        ) : budget.percentage > 80 ? (
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        <span className="text-sm font-medium text-gray-700">
                                            {budget.percentage.toFixed(0)}% used
                                        </span>
                                    </div>
                                    <span className={`text-sm font-medium ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {budget.remaining >= 0
                                            ? `${formatCurrency(budget.remaining)} left`
                                            : `${formatCurrency(Math.abs(budget.remaining))} over`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <BudgetForm
                    budget={editingBudget}
                    onClose={handleFormClose}
                />
            )}
        </div>
    );
}