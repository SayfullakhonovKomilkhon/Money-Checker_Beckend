export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserBalance {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
}

export type TransactionType = "income" | "expense";
export type InputMethod = "manual" | "automatic" | "import";

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  transaction_date: string;
  transaction_type: TransactionType;
  input_method: InputMethod;
  created_at: string;
}

export interface TransactionWithCategory extends Omit<Transaction, "category_id" | "input_method" | "created_at"> {
  categories: Category;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  created_at: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  due_date: string;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  deadline: string;
  category: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue" | "partial";
}

export type NotificationType = "goal" | "expense" | "reminder" | "limit";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  related_goal_id: string | null;
  related_limit_id: string | null;
  is_read: boolean;
  created_at: string | null;
}

export interface PlannedExpense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  date: string;
  notification_enabled: boolean;
}

export interface Saving {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: string;
  created_at: string;
}

export interface AuthenticatedRequest extends Express.Request {
  userId?: string;
}
