import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  Transaction,
  Budget,
  Group,
  Settlement,
  Category,
  User,
} from "../types";
import { generateId } from "../utils/helpers";

interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  groups: Group[];
  settlements: Settlement[];
  categories: Category[];
  currentUser: User;
  selectedMonth: string;
}

type AppAction =
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "UPDATE_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "ADD_GROUP"; payload: Group }
  | { type: "UPDATE_GROUP"; payload: Group }
  | { type: "DELETE_GROUP"; payload: string }
  | { type: "ADD_SETTLEMENT"; payload: Settlement }
  | { type: "SET_SELECTED_MONTH"; payload: string };

const initialCategories: Category[] = [
  { id: "1", name: "Food & Dining", icon: "🍽️", color: "#EF4444", type: "expense" },
  { id: "2", name: "Transportation", icon: "🚗", color: "#F59E0B", type: "expense" },
  { id: "3", name: "Shopping", icon: "🛍️", color: "#8B5CF6", type: "expense" },
  { id: "4", name: "Entertainment", icon: "🎬", color: "#EC4899", type: "expense" },
  { id: "5", name: "Bills & Utilities", icon: "⚡", color: "#06B6D4", type: "expense" },
  { id: "6", name: "Healthcare", icon: "🏥", color: "#10B981", type: "expense" },
  { id: "7", name: "Education", icon: "📚", color: "#3B82F6", type: "expense" },
  { id: "8", name: "Travel", icon: "✈️", color: "#F97316", type: "expense" },
  { id: "9", name: "Salary", icon: "💰", color: "#10B981", type: "income" },
  { id: "10", name: "Freelance", icon: "💻", color: "#6366F1", type: "income" },
  { id: "11", name: "Investment", icon: "📈", color: "#059669", type: "income" },
  { id: "12", name: "Other Income", icon: "💵", color: "#84CC16", type: "income" },
];

const initialState: AppState = {
  transactions: [],
  budgets: [],
  groups: [],
  settlements: [],
  categories: initialCategories,
  currentUser: {
    id: "user1",
    name: "Praghna Manthena",
    email: "praghna@example.com",
  },
  selectedMonth: new Date().toISOString().slice(0, 7),
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, action.payload] };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "ADD_BUDGET":
      return { ...state, budgets: [...state.budgets, action.payload] };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== action.payload),
      };
    case "ADD_GROUP":
      return { ...state, groups: [...state.groups, action.payload] };
    case "UPDATE_GROUP":
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case "DELETE_GROUP":
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
      };
    case "ADD_SETTLEMENT":
      return { ...state, settlements: [...state.settlements, action.payload] };
    case "SET_SELECTED_MONTH":
      return { ...state, selectedMonth: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  addTransaction: (txn: Transaction) => Promise<void>;
  updateTransaction: (txn: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ✅ Load transactions from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data: Transaction[] = await res.json();
        dispatch({ type: "SET_TRANSACTIONS", payload: data });
      } catch (err) {
        console.error("❌ Error loading transactions:", err);
      }
    })();
  }, []);

  // ✅ Helpers that also sync to backend
  const addTransaction = async (txn: Transaction) => {
    dispatch({ type: "ADD_TRANSACTION", payload: txn });
  };

  const updateTransaction = async (txn: Transaction) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: txn });
  };

  const deleteTransaction = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    } catch (err) {
      console.error("❌ Error deleting transaction:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{ state, addTransaction, updateTransaction, deleteTransaction }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
