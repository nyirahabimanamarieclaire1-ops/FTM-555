export interface Product {
  id: string;
  product_name: string;
  product_code: string;
  category_id: string;
  description: string;
  image_url: string;
  size: string;
  price: number;
  is_alcoholic: number;
  age_restricted: number;
  is_active: number;
  available_quantity?: number;
  reserved_quantity?: number;
  minimum_stock?: number;
}

export interface Order {
  id: string;
  order_id?: string;
  order_reference: string;
  customer_id: string;
  machine_id: string;
  total_amount: number;
  currency: string;
  order_status: string;
  payment_status: string;
  dispensing_status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  phone_number?: string;
  product_name?: string;
  quantity?: number;
  provider?: string;
  provider_transaction_id?: string;
  failure_reason?: string;
  sensor_confirmation?: string;
}

export interface PaymentEvent {
  id: string;
  payment_id: string;
  event_type: string;
  event_reference: string;
  event_status: string;
  event_timestamp: string;
  verification_result: string;
  safe_response_metadata?: string;
}

export interface MachineSensor {
  id: string;
  machine_id: string;
  sensor_type: string;
  sensor_value: number;
  unit: string;
  sensor_status: string;
  recorded_at: string;
}

export interface MachineAlert {
  id: string;
  machine_id: string;
  alert_type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  alert_status: 'ACTIVE' | 'RESOLVED';
  created_at: string;
  resolved_at?: string;
}

export interface SystemSetting {
  id: string;
  setting_name: string;
  setting_value: string;
  setting_category: string;
  updated_by: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_value?: string;
  new_value?: string;
  timestamp: string;
  ip_address?: string;
}

export interface DashboardStats {
  totalRevenueRwf: number;
  totalOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  failedPayments: number;
  dispensedCount: number;
  failedDispensingCount: number;
  totalUnitsInStock: number;
  lowStockAlerts: number;
  machineStatus: string;
  activeAlertsCount: number;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'SEMI_ADMIN' | 'TECHNICIAN' | 'STAFF';
  phone?: string;
  account_status: 'ACTIVE' | 'INACTIVE';
  last_login?: string;
  created_at: string;
}
