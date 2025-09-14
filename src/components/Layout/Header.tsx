import React from 'react';
import { Menu, Download, Upload, User } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { exportData, importData } from '../../utils/helpers';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { state, dispatch } = useApp();

  const handleExport = () => {
    exportData(state);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file)
        .then(data => {
          dispatch({ type: 'LOAD_DATA', payload: data });
        })
        .catch(error => {
          console.error('Import failed:', error);
          alert('Failed to import data. Please check the file format.');
        });
    }
  };

  const viewTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    budgets: 'Budgets',
    groups: 'Groups',
    reports: 'Reports'
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {viewTitles[currentView] || 'Budget Tracker'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Export Data"
          >
            <Download className="h-5 w-5 text-gray-600" />
          </button>
          
          <label className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" title="Import Data">
            <Upload className="h-5 w-5 text-gray-600" />
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
            <div className="p-2 rounded-full bg-blue-100">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{state.currentUser.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}