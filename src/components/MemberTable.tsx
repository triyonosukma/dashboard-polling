import React, { useState } from 'react';
import type { Member } from '../types';
import { Search, Filter, Copy, Check, AlertCircle, Mail } from 'lucide-react';

interface MemberTableProps {
  members: Member[];
  selectedDate: number;
  allDays: number[];
  activeTab: 'ALL' | 'PENDING' | 'COMPLETED';
  setActiveTab: (tab: 'ALL' | 'PENDING' | 'COMPLETED') => void;
  sendPendingToWhatsApp: () => void;
  sendPendingToEmail: () => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  selectedDate,
  allDays,
  activeTab,
  setActiveTab,
  sendPendingToWhatsApp,
  sendPendingToEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('ALL');
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  // Extract unique team leaders
  const leaders = ['ALL', ...Array.from(new Set(members.map(m => m.teamLeader)))];

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLeader = selectedLeader === 'ALL' || m.teamLeader === selectedLeader;
    
    const isPolledToday = m.attendance[selectedDate] === true;
    const matchesTab = 
      activeTab === 'ALL' ||
      (activeTab === 'PENDING' && !isPolledToday) ||
      (activeTab === 'COMPLETED' && isPolledToday);

    return matchesSearch && matchesLeader && matchesTab;
  });

  // Copy pending list to clipboard for WhatsApp
  const copyPendingToClipboard = () => {
    const pendingList = members.filter(m => !m.attendance[selectedDate]);
    if (pendingList.length === 0) return;

    let text = `*Daftar Belum Polling CX 100 Iconnet (Tgl ${selectedDate} Juli)*:\n\n`;
    pendingList.forEach((m, idx) => {
      text += `${idx + 1}. *${m.name}*\n`;
    });
    text += `\n*Link Polling*: https://bit.ly/pollingcx100iconnet\nMohon segera mengisi polling ya. Terima kasih!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Copy pending list details to clipboard and call sendPendingToEmail prop
  const copyEmailToClipboardAndSend = () => {
    const pendingList = members.filter(m => !m.attendance[selectedDate]);
    if (pendingList.length === 0) return;

    let body = `Daftar Belum Polling CX 100 Iconnet (Tgl ${selectedDate} Juli):\n\n`;
    pendingList.forEach((m, idx) => {
      body += `${idx + 1}. ${m.name} (${m.teamLeader})\n`;
    });
    body += `\nLink Polling: https://bit.ly/pollingcx100iconnet\n\nMohon segera mengisi polling ya. Terima kasih!`;

    navigator.clipboard.writeText(body).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    });

    sendPendingToEmail();
  };

  const getStatusBadge = (isCompleted: boolean) => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          Sudah Polling
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20">
        Belum Polling
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-md overflow-hidden">
      {/* Header and Controls */}
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-white">Detail Partisipasi Anggota</h4>
            <p className="text-xs text-slate-500">Gunakan filter untuk mencari data spesifik</p>
          </div>
          {activeTab === 'PENDING' && filteredMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyPendingToClipboard}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Tersalin!' : 'Salin Daftar WA'}
              </button>
              <button
                onClick={sendPendingToWhatsApp}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-sm font-semibold text-white px-4 py-2 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <svg
                  className="h-4 w-4 fill-current text-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Kirim WA ke 082139958459
              </button>
              <button
                onClick={copyEmailToClipboardAndSend}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-sm font-semibold text-white px-4 py-2 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {emailCopied ? <Check size={16} /> : <Mail size={16} />}
                {emailCopied ? 'Teks Email Tersalin!' : 'Kirim Email ke triyono.sukma09@gmail.com'}
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-slate-800/80 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition duration-200 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>

          {/* Filter Team Leader */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Filter size={18} />
            </div>
            <select
              value={selectedLeader}
              onChange={e => setSelectedLeader(e.target.value)}
              className="block w-full rounded-xl border border-slate-800/80 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none transition duration-200 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40 appearance-none cursor-pointer"
            >
              {leaders.map(l => (
                <option key={l} value={l} className="bg-slate-950 text-slate-200">
                  {l === 'ALL' ? 'Semua Team Leader' : l}
                </option>
              ))}
            </select>
          </div>

          {/* Selection tabs */}
          <div className="flex rounded-xl bg-slate-950/50 p-1 border border-slate-800/60">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition ${
                activeTab === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({members.filter(m => selectedLeader === 'ALL' || m.teamLeader === selectedLeader).length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition ${
                activeTab === 'PENDING'
                  ? 'bg-rose-950/40 text-rose-400 shadow-sm border border-rose-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Belum ({members.filter(m => !m.attendance[selectedDate] && (selectedLeader === 'ALL' || m.teamLeader === selectedLeader)).length})
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition ${
                activeTab === 'COMPLETED'
                  ? 'bg-emerald-950/40 text-emerald-400 shadow-sm border border-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sudah ({members.filter(m => m.attendance[selectedDate] && (selectedLeader === 'ALL' || m.teamLeader === selectedLeader)).length})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/10">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">NO</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">TEAM LEADER</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">NAMA / EMAIL</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">STATUS (TGL {selectedDate})</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">RASIO</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">RIWAYAT BULANAN (JULI)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 bg-slate-950/10">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr
                  key={`${member.no}-${member.email}`}
                  className="hover:bg-slate-900/20 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">
                    {member.no}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-300">
                      {member.teamLeader}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {member.name}
                      </span>
                      <span className="text-xs text-slate-500 font-normal">
                        {member.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(member.attendance[selectedDate])}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-slate-300">
                        {member.completionRate}%
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ({member.totalCompleted}/{member.totalDays} hari)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Calendar grid strip */}
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {allDays.map((day) => {
                        const hasPolled = member.attendance[day];
                        const isCurrent = day === selectedDate;
                        return (
                          <div
                            key={day}
                            title={`Tanggal ${day} Juli: ${hasPolled ? 'Sudah Polling' : 'Belum Polling'}`}
                            className={`h-5 w-5 rounded flex items-center justify-center text-[8px] font-bold transition-all ${
                              hasPolled
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-900/80 text-slate-600 border border-slate-800'
                            } ${
                              isCurrent
                                ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 scale-110 z-10'
                                : ''
                            } cursor-help`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                    <AlertCircle size={32} className="text-slate-600" />
                    <p className="text-sm font-medium">Tidak ada data yang cocok dengan kriteria pencarian</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
