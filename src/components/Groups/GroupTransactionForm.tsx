import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Group, Transaction, TransactionSplit } from '../../types';
import { generateId } from '../../utils/helpers';
import { X } from 'lucide-react';

interface GroupTransactionFormProps {
  group: Group;
  onClose: () => void;
}

export function GroupTransactionForm({ group, onClose }: GroupTransactionFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: group.members[0]?.id || '',
    splitType: 'equal' as 'equal' | 'custom'
  });
  
  const [customSplits, setCustomSplits] = useState<Record<string, string>>(
    group.members.reduce((acc, member) => ({ ...acc, [member.id]: '' }), {})
  );

  const expenseCategories = state.categories.filter(cat => 
    cat.type === 'expense' || cat.type === 'both'
  );

  const handleSplitTypeChange = (type: 'equal' | 'custom') => {
    setFormData({ ...formData, splitType: type });
    if (type === 'equal') {
      const equalAmount = (parseFloat(formData.amount) || 0) / group.members.length;
      setCustomSplits(
        group.members.reduce((acc, member) => ({ 
          ...acc, 
          [member.id]: equalAmount.toFixed(2) 
        }), {})
      );
    }
  };

  const handleAmountChange = (amount: string) => {
    setFormData({ ...formData, amount });
    if (formData.splitType === 'equal' && amount) {
      const equalAmount = parseFloat(amount) / group.members.length;
      setCustomSplits(
        group.members.reduce((acc, member) => ({ 
          ...acc, 
          [member.id]: equalAmount.toFixed(2) 
        }), {})
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = parseFloat(formData.amount);
    const splits: TransactionSplit[] = group.members.map(member => ({
      userId: member.id,
      amount: parseFloat(customSplits[member.id] || '0'),
      paid: member.id === formData.paidBy
    }));

    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
    
    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      alert('Split amounts must equal the total amount');
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      amount: totalAmount,
      type: 'expense',
      category: formData.category,
      description: formData.description,
      date: formData.date,
      groupId: group.id,
      splits
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Group Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

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
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What was this expense for?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid by
              </label>
              <select
                required
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {group.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Split Method
            </label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="equal"
                  checked={formData.splitType === 'equal'}
                  onChange={(e) => handleSplitTypeChange(e.target.value as 'equal')}
                  className="mr-2 text-blue-600"
                />
                Split Equally
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="custom"
                  checked={formData.splitType === 'custom'}
                  onChange={(e) => handleSplitTypeChange(e.target.value as 'custom')}
                  className="mr-2 text-blue-600"
                />
                Custom Split
              </label>
            </div>

            <div className="space-y-3">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{member.name}</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={customSplits[member.id] || ''}
                    onChange={(e) => setCustomSplits({ 
                      ...customSplits, 
                      [member.id]: e.target.value 
                    })}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.splitType === 'equal'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}