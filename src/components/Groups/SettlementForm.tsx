import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Group, Settlement } from '../../types';
import { generateId } from '../../utils/helpers';
import { X } from 'lucide-react';

interface SettlementFormProps {
  group: Group;
  onClose: () => void;
}

export function SettlementForm({ group, onClose }: SettlementFormProps) {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    fromUserId: '',
    toUserId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.fromUserId === formData.toUserId) {
      alert('Please select different people for the settlement');
      return;
    }

    const settlement: Settlement = {
      id: generateId(),
      groupId: group.id,
      fromUserId: formData.fromUserId,
      toUserId: formData.toUserId,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description || 'Settlement payment'
    };

    dispatch({ type: 'ADD_SETTLEMENT', payload: settlement });
    onClose();
  };

  const fromMember = group.members.find(m => m.id === formData.fromUserId);
  const toMember = group.members.find(m => m.id === formData.toUserId);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Record Settlement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From (Person paying)
            </label>
            <select
              required
              value={formData.fromUserId}
              onChange={(e) => setFormData({ ...formData, fromUserId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select person</option>
              {group.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To (Person receiving)
            </label>
            <select
              required
              value={formData.toUserId}
              onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select person</option>
              {group.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Payment description"
            />
          </div>

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

          {fromMember && toMember && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="text-blue-800">
                <strong>{fromMember.name}</strong> pays <strong>{toMember.name}</strong> ${formData.amount || '0.00'}
              </p>
            </div>
          )}

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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Record Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}