import Papa from 'papaparse';
import type { Member, DailyStats, LeaderStats, PollingData } from '../types';

export function getExportUrl(url: string): string {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/gid=([0-9]+)/);
  
  const id = idMatch ? idMatch[1] : '1XsaPINo8qJW8IKoJaOkCk2ZLg_0W3ffyfQ4TZO54iLE';
  const gid = gidMatch ? gidMatch[1] : '1109328157';
  
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

export function parsePollingCSV(csvText: string, isFallback: boolean = false): PollingData {
  const result = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  });

  const rows = result.data;
  
  // Find the polling link
  let pollingLink = 'https://bit.ly/pollingcx100iconnet';
  const linkRow = rows.find(r => r[1] && r[1].toLowerCase().includes('link poling'));
  if (linkRow && linkRow[2]) {
    pollingLink = linkRow[2].trim();
  }

  // Find the header rows
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i][0]?.trim();
    if (firstCell === 'NO' || rows[i][2]?.trim() === 'NAMA') {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('Header row not found in CSV');
  }

  const daysRow = rows[headerIndex + 1];
  const activeDays: number[] = [];
  
  // Extract days from index 4 onwards
  for (let j = 4; j < daysRow.length; j++) {
    const val = daysRow[j]?.trim();
    if (val && !isNaN(Number(val))) {
      activeDays.push(Number(val));
    }
  }

  const rawMembers: { no: number; rawLeader: string; name: string; email: string; row: string[] }[] = [];
  const leaderCounts: Record<string, number> = {};

  // Process members starting from headerIndex + 2
  for (let i = headerIndex + 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) continue;
    
    const no = parseInt(row[0]);
    if (isNaN(no) || !row[2]) {
      continue;
    }

    const rawLeader = row[1] ? row[1].trim() : '';
    const name = row[2].trim();
    const email = row[3].trim();
    
    if (rawLeader && rawLeader !== '-') {
      leaderCounts[rawLeader] = (leaderCounts[rawLeader] || 0) + 1;
    }

    rawMembers.push({ no, rawLeader, name, email, row });
  }

  // Find the most common team leader name
  let commonLeader = 'No Leader';
  let maxCount = 0;
  Object.entries(leaderCounts).forEach(([leader, count]) => {
    if (count > maxCount) {
      maxCount = count;
      commonLeader = leader;
    }
  });

  const members: Member[] = [];
  rawMembers.forEach(({ no, rawLeader, name, email, row }) => {
    let teamLeader = rawLeader;
    if (!rawLeader || rawLeader === '-') {
      if (name.toLowerCase() === commonLeader.toLowerCase()) {
        teamLeader = `${commonLeader} (Self)`;
      } else {
        teamLeader = commonLeader;
      }
    }

    const attendance: Record<number, boolean> = {};
    let totalCompleted = 0;

    activeDays.forEach((day, idx) => {
      const colIdx = 4 + idx;
      const statusStr = row[colIdx] ? row[colIdx].trim().toUpperCase() : 'FALSE';
      const isCompleted = statusStr === 'TRUE';
      attendance[day] = isCompleted;
      if (isCompleted) {
        totalCompleted++;
      }
    });

    members.push({
      no,
      teamLeader,
      name,
      email,
      attendance,
      totalCompleted,
      totalDays: activeDays.length,
      completionRate: 0, // will calculate based on days with actual data
    });
  });

  // Determine active days dynamically:
  // - Days that have at least one TRUE value.
  // - Days in July that are <= today's day (July 5th, 2026).
  const today = new Date();
  const currentDay = today.getDate();
  const activeDaysWithData = activeDays.filter(day => {
    const isPastOrPresent = day <= currentDay;
    const hasTrueValue = members.some(m => m.attendance[day] === true);
    return isPastOrPresent || hasTrueValue;
  });
  
  const dynamicActiveDays = activeDaysWithData.length > 0 ? activeDaysWithData : [3];

  // Re-calculate completion rate based on active days with data
  members.forEach(m => {
    let completedInActive = 0;
    dynamicActiveDays.forEach(day => {
      if (m.attendance[day]) {
        completedInActive++;
      }
    });
    m.totalCompleted = completedInActive;
    m.totalDays = dynamicActiveDays.length;
    m.completionRate = dynamicActiveDays.length > 0 
      ? Math.round((completedInActive / dynamicActiveDays.length) * 100) 
      : 0;
  });

  // Calculate Daily Stats
  const dailyStats: DailyStats[] = activeDays.map(day => {
    let completed = 0;
    let pending = 0;
    members.forEach(m => {
      if (m.attendance[day]) {
        completed++;
      } else {
        pending++;
      }
    });
    const percentage = members.length > 0 ? Math.round((completed / members.length) * 100) : 0;
    return {
      day,
      completed,
      pending,
      percentage,
    };
  });

  // Calculate Leader Stats
  const leaderGroups: Record<string, Member[]> = {};
  members.forEach(m => {
    if (!leaderGroups[m.teamLeader]) {
      leaderGroups[m.teamLeader] = [];
    }
    leaderGroups[m.teamLeader].push(m);
  });

  const leaderStats: LeaderStats[] = Object.keys(leaderGroups).map(leaderName => {
    const groupMembers = leaderGroups[leaderName];
    const totalMembers = groupMembers.length;
    let totalCompleted = 0;
    
    groupMembers.forEach(m => {
      dynamicActiveDays.forEach(day => {
        if (m.attendance[day]) {
          totalCompleted++;
        }
      });
    });

    const totalPossible = totalMembers * dynamicActiveDays.length;
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    return {
      leaderName,
      totalMembers,
      totalCompleted,
      totalPossible,
      completionRate,
    };
  });

  // Sort leaderStats by completionRate desc
  leaderStats.sort((a, b) => b.completionRate - a.completionRate);

  return {
    members,
    dailyStats,
    leaderStats,
    activeDays: dynamicActiveDays,
    lastUpdated: new Date().toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    pollingLink,
    isFallback,
  };
}

export async function fetchPollingData(sheetUrl: string): Promise<PollingData> {
  try {
    const csvUrl = getExportUrl(sheetUrl);
    
    const response = await fetch(csvUrl, { method: 'GET', mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    if (!csvText || csvText.includes('<!DOCTYPE html>')) {
      throw new Error('Response is HTML instead of CSV, possibly private sheet');
    }
    return parsePollingCSV(csvText, false);
  } catch (error) {
    console.warn("Using fallback local data due to error fetching Google Sheets CSV: ", error);
    const { FALLBACK_CSV } = await import('../data/fallbackData');
    return parsePollingCSV(FALLBACK_CSV, true);
  }
}
