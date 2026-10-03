export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: string;
  item_count?: number;
}

export interface UnitOption {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  detailed_description: string;
  price: number;
  category_id: string;
  category_slug: string;
  image: string;
  hover_image?: string;
  gallery?: string[];
  stock: number;
  sku: string;
  weight: string;
  unit_options?: UnitOption[];
  ingredients: string;
  allergen_info?: string;
  storage_info: string;
  origin?: string;
  image_note?: string;
  sizes?: string[];
  colors?: string[];
  is_featured: boolean;
  is_bestseller?: boolean;
  created_at: string;
}

export interface User {
  id: string;
  google_id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_image: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_size?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_country: string;
  delivery_fee: number;
  subtotal: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  payment_status: 'paid';
  mailgun_status: 'sent' | 'queued' | 'preview_mode' | 'failed';
  idempotency_key?: string;
  created_at: string;
  items: OrderItem[];
  email_preview?: {
    subject: string;
    from: string;
    to: string;
    html: string;
    text: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  unitPrice?: number;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  deliveryAddress: string;
  city: string;
  state: string;
  country: string;
  deliveryZone: string;
}

