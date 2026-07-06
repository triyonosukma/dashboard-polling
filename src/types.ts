export interface Member {
  no: number;
  teamLeader: string;
  name: string;
  email: string;
  attendance: Record<number, boolean>; // key: day of month (3 to 31), value: completed (true/false)
  totalCompleted: number;
  totalDays: number;
  completionRate: number; // percentage
}

export interface DailyStats {
  day: number;
  completed: number;
  pending: number;
  percentage: number;
}

export interface LeaderStats {
  leaderName: string;
  totalMembers: number;
  totalCompleted: number;
  totalPossible: number; // totalMembers * activeDays
  completionRate: number; // percentage
}

export interface PollingData {
  members: Member[];
  dailyStats: DailyStats[];
  leaderStats: LeaderStats[];
  activeDays: number[];
  lastUpdated: string;
  pollingLink: string;
  isFallback?: boolean;
}
