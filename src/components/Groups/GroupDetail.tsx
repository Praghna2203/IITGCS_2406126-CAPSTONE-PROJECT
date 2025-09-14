import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Group } from '../../types';
import { GroupTransactionForm } from './GroupTransactionForm';
import { SettlementForm } from './SettlementForm';
import { formatCurrency, formatDate, calculateGroupBalances } from '../../utils/helpers';
import { ArrowLeft, Plus, DollarSign, Users, Calendar } from 'lucide-react';

interface GroupDetailProps {
  group: Group;
  onBack: () => void;
}

export function GroupDetail({ group, onBack }: GroupDetailProps) {
  const { state } = useApp();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showSettlementForm, setShowSettlementForm] = useState(false);

  const updatedGroup = calculateGroupBalances(group, state.transactions, state.settlements);
  const groupTransactions = state.transactions.filter(t => t.groupId === group.id);
  const groupSettlements = state.settlements.filter(s => s.groupId === group.id);

  const totalGroupExpenses = groupTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{updatedGroup.name}</h1>
            <p className="text-gray-600">{updatedGroup.description}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTransactionForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setShowSettlementForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Settle Up</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-semibold text-gray-900">{updatedGroup.members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalGroupExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-amber-50">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">{groupTransactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Balances</h3>
          <div className="space-y-3">
            {updatedGroup.members.map(member => (
              <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  member.balance > 0 
                    ? 'text-green-600' 
                    : member.balance < 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {member.balance > 0 
                    ? `is owed ${formatCurrency(member.balance)}`
                    : member.balance < 0 
                    ? `owes ${formatCurrency(Math.abs(member.balance))}`
                    : 'settled up'
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {[...groupTransactions, ...groupSettlements]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((item) => {
                const isTransaction = 'type' in item;
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {isTransaction ? item.description : `Settlement: ${item.description}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(item.date)}
                        {isTransaction && item.splits && (
                          <span className="ml-2">
                            • Split among {item.splits.length} members
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={`font-semibold ${
                      isTransaction 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                );
              })}
            {[...groupTransactions, ...groupSettlements].length === 0 && (
              <p className="text-gray-500 text-center py-4">No group activity yet</p>
            )}
          </div>
        </div>
      </div>

      {showTransactionForm && (
        <GroupTransactionForm
          group={updatedGroup}
          onClose={() => setShowTransactionForm(false)}
        />
      )}

      {showSettlementForm && (
        <SettlementForm
          group={updatedGroup}
          onClose={() => setShowSettlementForm(false)}
        />
      )}
    </div>
  );
}