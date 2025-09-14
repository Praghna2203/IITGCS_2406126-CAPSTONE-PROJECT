import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { GroupForm } from './GroupForm';
import { GroupDetail } from './GroupDetail';
import { formatCurrency } from '../../utils/helpers';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { Group } from '../../types';

export function GroupList() {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  if (selectedGroup) {
    return (
      <GroupDetail 
        group={selectedGroup} 
        onBack={() => setSelectedGroup(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Groups</h2>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Group</span>
        </button>
      </div>

      {state.groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No groups yet</p>
          <p className="text-gray-400 text-sm">Create a group to start sharing expenses with others</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.groups.map(group => {
            const totalBalance = group.members.reduce((sum, member) => sum + Math.abs(member.balance), 0);
            const membersWithBalances = group.members.filter(member => member.balance !== 0);
            
            return (
              <div 
                key={group.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Members</span>
                    <span className="font-semibold text-gray-900">
                      {group.members.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Outstanding</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(totalBalance)}
                    </span>
                  </div>

                  {membersWithBalances.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {membersWithBalances.length} member{membersWithBalances.length > 1 ? 's' : ''} with balances
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((member, index) => (
                        <div
                          key={member.id}
                          className="h-8 w-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-600"
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <GroupForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}