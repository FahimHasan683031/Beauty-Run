export type ICreateAccount = {
  name: string
  email: string
  otp: string
}

export type IResetPassword = {
  name: string
  email: string
  otp: string
}


export type IEmailOrPhoneVerification = {
  name: string
  email?: string
  phone?: string
  type: 'createAccount' | 'resetPassword'
}

export type ISupportTicketResolved = {
  name: string
  email: string
  ticketTitle: string
  adminReply?: string
}

export type IOrderInvoice = {
  orderId: string;
  transactionId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  productName: string;
  productPrice: number;
  quantity: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
}

export type ISupportTicketNotification = {
  userName: string;
  userEmail: string;
  ticketTitle: string;
  ticketDescription: string;
}
