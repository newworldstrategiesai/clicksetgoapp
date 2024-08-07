// utils/types.ts
export interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email_address?: string;
    user_id: string;
  }
  
  export interface List {
    id: string;
    name: string;
    contactsCount: number;
  }
  