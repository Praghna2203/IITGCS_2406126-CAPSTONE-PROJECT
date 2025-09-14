import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getMonthName } from '../../utils/helpers';

export function MonthSelector() {
  const { state, dispatch } = useApp();
  
  const changeMonth = (direction: 'prev' | 'next') => {
    const currentDate = new Date(state.selectedMonth + '-01');
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const newMonth = currentDate.toISOString().slice(0, 7);
    dispatch({ type: 'SET_SELECTED_MONTH', payload: newMonth });
  };

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <button
        onClick={() => changeMonth('prev')}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>
      
      <span className="px-4 py-1 font-medium text-gray-900 min-w-[140px] text-center">
        {getMonthName(state.selectedMonth)}
      </span>
      
      <button
        onClick={() => changeMonth('next')}
        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}