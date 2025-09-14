import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Budget } from '../../types';
import { generateId, getMonthName } from '../../utils/helpers';
import { X } from 'lucide-react';

interface BudgetFormProps {
    budget?: Budget | null;
    onClose: () => void;
}

export function BudgetForm({ budget, onClose }: BudgetFormProps) {
    const { state, dispatch } = useApp();
    const [formData, setFormData] = useState({
        category: '',
        limit: '',
        month: state.selectedMonth
    });

    useEffect(() => {
        if (budget) {
            setFormData({
                category: budget.category,
                limit: budget.limit.toString(),
                month: budget.month
            });
        }
    }, [budget]);

    const expenseCategories = state.categories.filter(cat =>
        cat.type === 'expense' || cat.type === 'both'
    );

    // Filter out categories that already have budgets for this month
    const availableCategories = expenseCategories.filter(cat => {
        if (budget && cat.name === budget.category) return true;
        return !state.budgets.some(b =>
            b.category === cat.name && b.month === formData.month && b.id !== budget?.id
        );
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const budgetData: Budget = {
            id: budget?.id || generateId(),
            category: formData.category,
            limit: parseFloat(formData.limit),
            month: formData.month,
            spent: 0 // This will be calculated dynamically
        };

        if (budget) {
            dispatch({ type: 'UPDATE_BUDGET', payload: budgetData });
        } else {
            dispatch({ type: 'ADD_BUDGET', payload: budgetData });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {budget ? 'Edit Budget' : 'Add Budget'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a category</option>
                            {availableCategories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.icon} {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Limit
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Month
                        </label>
                        <input
                            type="month"
                            required
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Currently set for {getMonthName(formData.month)}
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {budget ? 'Update' : 'Create'} Budget
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}