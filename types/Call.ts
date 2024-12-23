export interface Call {
  id: string;
  agentName: string;
  customerName: string;
  duration: number;
  status: 'active' | 'on hold' | 'muted' | 'ended';
  transcript?: string[];
}

