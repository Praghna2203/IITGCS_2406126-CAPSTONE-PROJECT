import { Transaction, Budget, Group } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthName(monthString: string): string {
  const date = new Date(monthString + '-01');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export function calculateBudgetSpent(transactions: Transaction[], category: string, month: string): number {
  return transactions
    .filter(t => 
      t.type === 'expense' &&
      t.category === category &&
      t.date.startsWith(month) &&
      !t.groupId // Exclude group transactions from budget calculations
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyTransactions(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter(t => t.date.startsWith(month) && !t.groupId);
}

export function calculateGroupBalances(group: Group, transactions: Transaction[], settlements: any[]): Group {
  const updatedMembers = group.members.map(member => ({ ...member, balance: 0 }));
  
  // Calculate balances from group transactions
  transactions
    .filter(t => t.groupId === group.id)
    .forEach(transaction => {
      if (transaction.splits) {
        transaction.splits.forEach(split => {
          const member = updatedMembers.find(m => m.id === split.userId);
          if (member) {
            if (split.paid) {
              // If this member paid, they are owed money by others
              member.balance += (transaction.amount - split.amount);
            } else {
              // If this member didn't pay, they owe money
              member.balance -= split.amount;
            }
          }
        });
      }
    });

  // Apply settlements
  settlements
    .filter(s => s.groupId === group.id)
    .forEach(settlement => {
      const fromMember = updatedMembers.find(m => m.id === settlement.fromUserId);
      const toMember = updatedMembers.find(m => m.id === settlement.toUserId);
      if (fromMember && toMember) {
        fromMember.balance -= settlement.amount; // Person paying reduces their debt/increases what they're owed
        toMember.balance += settlement.amount;   // Person receiving increases their debt/reduces what they're owed
      }
    });

  return { ...group, members: updatedMembers };
}

export function getCategoryColor(categories: any[], categoryName: string): string {
  const category = categories.find(c => c.name === categoryName);
  return category?.color || '#6B7280';
}

export function exportData(data: any): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}