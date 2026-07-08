import { useState, useEffect } from 'react';
import { fetchPollingData } from './utils/csvParser';
import type { PollingData } from './types';
import { StatCard } from './components/StatCard';
import { Charts } from './components/Charts';
import { MemberTable } from './components/MemberTable';
import { 
  Users, 
  ExternalLink, 
  Percent, 
  Award, 
  RefreshCw, 
  Calendar, 
  Database,
  Info,
  Bell,
  BellOff
} from 'lucide-react';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1XsaPINo8qJW8IKoJaOkCk2ZLg_0W3ffyfQ4TZO54iLE/edit?gid=924029529#gid=924029529';

function App() {
  const [data, setData] = useState<PollingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(3);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  
  // Auto-refresh and Desktop Notification states
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const loadData = async (forceSync = false) => {
    if (forceSync) {
      setIsSyncing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      // Fetch fresh data
      const parsedData = await fetchPollingData(SHEET_URL);
      setData(parsedData);
      setIsUsingFallback(parsedData.isFallback || false);
      
      // Determine default selected date: the latest day with data
      if (parsedData.activeDays.length > 0) {
        const latestDay = Math.max(...parsedData.activeDays);
        setSelectedDate(latestDay);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal memuat data polling.');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  // Send pending list to WhatsApp number 082139958459
  const sendPendingToWhatsApp = () => {
    if (!data) return;
    const pendingList = data.members.filter(m => !m.attendance[selectedDate]);
    if (pendingList.length === 0) return;

    let text = `*Daftar Belum Polling CX 100 Iconnet (Tgl ${selectedDate} Juli)*:\n\n`;
    pendingList.forEach((m, idx) => {
      text += `${idx + 1}. *${m.name}*\n`;
    });
    text += `\n*Link Polling*: https://bit.ly/pollingcx100iconnet\nMohon segera mengisi polling ya. Terima kasih!`;

    // format: 082139958459 -> 6282139958459
    const whatsappUrl = `https://wa.me/6282139958459?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Send pending list to email: triyono.sukma09@gmail.com
  const sendPendingToEmail = () => {
    if (!data) return;
    const pendingList = data.members.filter(m => !m.attendance[selectedDate]);
    if (pendingList.length === 0) return;

    const subject = `Daftar Belum Polling CX 100 Iconnet (Tgl ${selectedDate} Juli)`;
    let body = `Daftar Belum Polling CX 100 Iconnet (Tgl ${selectedDate} Juli):\n\n`;
    pendingList.forEach((m, idx) => {
      body += `${idx + 1}. ${m.name} (${m.teamLeader})\n`;
    });
    body += `\nLink Polling: https://bit.ly/pollingcx100iconnet\n\nMohon segera mengisi polling ya. Terima kasih!`;

    const mailtoUrl = `mailto:triyono.sukma09@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  // Toggle browser notification permission and state
  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung notifikasi desktop.');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    } else if (Notification.permission === 'denied') {
      alert('Akses notifikasi diblokir oleh browser. Silakan izinkan notifikasi dari pengaturan browser Anda.');
      setNotificationsEnabled(false);
    } else {
      setNotificationsEnabled(prev => !prev);
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
        });
      }
    }
  }, []);

  // Auto load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto refresh every 2 minutes (120,000ms)
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      loadData(true);
    }, 120000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Trigger browser notification when the data is loaded/synchronized
  useEffect(() => {
    if (!data || !notificationsEnabled) return;

    // Filter pending members for the currently selected date
    const pendingList = data.members.filter(m => !m.attendance[selectedDate]);
    const pendingEmails = pendingList.map(m => m.email);

    // Only notify if there are pending members
    if (pendingEmails.length > 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`Sales Belum Polling (Tgl ${selectedDate} Juli)`, {
          body: `${pendingEmails.length} sales belum mengisi polling. Klik untuk kirim rekap WA ke 082139958459.`,
          tag: `polling-pending-${selectedDate}-${Date.now()}`,
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          sendPendingToWhatsApp();
        };
      }
    }
  }, [data, selectedDate, notificationsEnabled]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#05070f] text-gray-200">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Database size={20} className="animate-pulse text-indigo-400" />
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wide text-indigo-300">Menghubungkan ke Google Sheets...</p>
        <p className="mt-1 text-xs text-slate-500">Mengunduh data partisipasi secara real-time</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#05070f] p-6 text-gray-200">
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center max-w-md backdrop-blur-md">
          <Info size={40} className="mx-auto text-red-500" />
          <h3 className="mt-4 text-lg font-bold text-white">Terjadi Kesalahan</h3>
          <p className="mt-2 text-sm text-slate-400">{error || 'Data tidak ditemukan.'}</p>
          <button
            onClick={() => loadData()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-all active:scale-95"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalMembers = data.members.length;
  
  // Polling rate of the selected day
  const selectedDayStats = data.dailyStats.find(d => d.day === selectedDate) || {
    day: selectedDate,
    completed: 0,
    pending: totalMembers,
    percentage: 0
  };

  // Overall average polling rate of all members in active days
  const overallRate = data.members.length > 0
    ? Math.round(data.members.reduce((acc, curr) => acc + curr.completionRate, 0) / totalMembers)
    : 0;

  // Polling Link
  const pollingLink = 'https://bit.ly/pollingcx100iconnet';

  // Available days list (from 3 to 31)
  const allDaysList = Array.from({ length: 29 }, (_, i) => i + 3);

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-200">
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-900 bg-slate-950/40 py-5 backdrop-blur-lg sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title Block */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Dashboard Polling CX 100
                </h1>
                <p className="text-xs text-slate-400 font-normal">
                  Monitoring Partisipasi Polling Harian Sales Iconnet
                </p>
              </div>
            </div>

            {/* Actions Block */}
            <div className="flex flex-wrap items-center gap-3 sm:self-center">
              <span className="hidden text-xs text-slate-500 md:inline font-mono">
                Pembaruan: {data.lastUpdated}
              </span>
              
              {/* Auto Sync Toggle */}
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                  isAutoRefresh
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title="Sinkronisasi otomatis setiap 2 menit"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${isAutoRefresh ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                Auto Sync {isAutoRefresh ? '2m ON' : 'OFF'}
              </button>

              {/* Notification Toggle */}
              <button
                onClick={toggleNotifications}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                  notificationsEnabled && (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted')
                    ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title="Notifikasi desktop jika ada data baru belum polling"
              >
                {notificationsEnabled && (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') ? (
                  <Bell size={14} className="animate-bounce" />
                ) : (
                  <BellOff size={14} />
                )}
                Notifikasi {notificationsEnabled && (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') ? 'Aktif' : 'Nonaktif'}
              </button>

              <button
                onClick={() => loadData(true)}
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin text-indigo-400' : ''} />
                {isSyncing ? 'Menyinkronkan...' : 'Sinkron Sheet'}
              </button>
              <a
                href={SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 px-3.5 py-2 text-xs font-semibold text-indigo-400 transition-all cursor-pointer"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Google Sheets</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Fallback Warning Banner */}
      {isUsingFallback && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs text-amber-400 font-medium flex items-center justify-center gap-2">
          <Info size={14} className="shrink-0" />
          <span>Menggunakan data lokal cadangan. Koneksi langsung ke Google Sheet gagal (masalah CORS browser atau Anda sedang offline).</span>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Statistics Cards */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Anggota Sales"
            value={totalMembers}
            icon={<Users size={24} />}
            description="Anggota aktif terdaftar"
            gradient="from-blue-600 to-cyan-500"
          />
          <StatCard
            title={`Partisipasi Tgl ${selectedDate}`}
            value={`${selectedDayStats.percentage}%`}
            icon={<Percent size={24} />}
            description={`${selectedDayStats.completed} dari ${totalMembers} selesai`}
            gradient="from-emerald-600 to-teal-500"
            action={
              <button
                onClick={() => {
                  setActiveTab('PENDING');
                  const tableElement = document.getElementById('sales-table-section');
                  if (tableElement) {
                    tableElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-between w-full text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <span>Lihat Belum Polling</span>
                <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] border border-emerald-500/20">
                  {selectedDayStats.pending} Belum
                </span>
              </button>
            }
          />
          <StatCard
            title="Rata-rata Bulan Ini"
            value={`${overallRate}%`}
            icon={<Award size={24} />}
            description="Rasio partisipasi kumulatif"
            gradient="from-indigo-600 to-purple-500"
          />
          <StatCard
            title="Link Poling Tim"
            value="CX 100 Iconnet"
            icon={<ExternalLink size={24} />}
            description="Kunjungi link pengisian polling"
            gradient="from-amber-600 to-orange-500"
            action={
              <a
                href={pollingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 group"
              >
                <span>Buka Link Polling</span>
                <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            }
          />
        </section>

        {/* Date Selector Strip */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              <h3 className="text-md font-semibold text-white">Kalender Pemantauan Polling (Juli)</h3>
            </div>
            
            {/* Quick Filter Toggle Button */}
            <button
              onClick={() => {
                setActiveTab(activeTab === 'PENDING' ? 'ALL' : 'PENDING');
                const tableElement = document.getElementById('sales-table-section');
                if (tableElement) {
                  tableElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeTab === 'PENDING' ? 'bg-rose-500' : 'bg-slate-600'}`} />
              Filter Belum Polling ({selectedDayStats.pending})
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Pilih tanggal di bawah untuk melihat kepatuhan pengisian polling pada hari tersebut. Tanggal dengan indikator hijau menandakan memiliki data polling.
          </p>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {allDaysList.map(day => {
              const hasData = data.activeDays.includes(day);
              const isSelected = selectedDate === day;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`relative flex flex-col items-center justify-center h-14 w-12 rounded-xl text-xs font-semibold transition-all active:scale-90 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : hasData
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-emerald-500/30'
                      : 'bg-slate-950/40 hover:bg-slate-900 text-slate-600 border border-slate-800/40'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 font-medium">Tgl</span>
                  <span className="text-base font-bold">{day}</span>
                  {hasData && !isSelected && (
                    <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Charts Section */}
        <section>
          <Charts dailyStats={data.dailyStats} leaderStats={data.leaderStats} selectedDate={selectedDate} />
        </section>

        {/* Details Table Section */}
        <section id="sales-table-section">
          <MemberTable 
            members={data.members} 
            selectedDate={selectedDate} 
            allDays={data.activeDays}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sendPendingToWhatsApp={sendPendingToWhatsApp}
            sendPendingToEmail={sendPendingToEmail}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p>Dashboard Polling CX 100 Iconnet &copy; 2026. Diperbarui secara berkala dari Google Sheets.</p>
          <p className="font-mono text-[10px]">
            Sumber Sheet: <a href={SHEET_URL} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:underline hover:text-indigo-400">{SHEET_URL}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
