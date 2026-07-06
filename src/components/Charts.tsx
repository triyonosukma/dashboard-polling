import React from 'react';
import Chart from 'react-apexcharts';
import type { DailyStats, LeaderStats } from '../types';

interface ChartsProps {
  dailyStats: DailyStats[];
  leaderStats: LeaderStats[];
  selectedDate: number;
}

export const Charts: React.FC<ChartsProps> = ({ dailyStats, leaderStats, selectedDate }) => {
  // Sort dailyStats by day ascending
  const sortedDaily = [...dailyStats].sort((a, b) => a.day - b.day);
  const days = sortedDaily.map(d => `Tgl ${d.day}`);
  const completedData = sortedDaily.map(d => d.completed);
  const pendingData = sortedDaily.map(d => d.pending);

  const trendSeries = [
    {
      name: 'Sudah Polling',
      data: completedData,
    },
    {
      name: 'Belum Polling',
      data: pendingData,
    },
  ];

  const trendOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: {
        show: false,
      },
      fontFamily: 'Inter, sans-serif',
      foreColor: '#94a3b8',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    colors: ['#10b981', '#ef4444'], // Emerald (TRUE), Red (FALSE)
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: days,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => Math.round(val).toString(),
      },
    },
    tooltip: {
      theme: 'dark',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#f8fafc',
      },
    },
  };

  // Selected Day Stats (for Pie Chart)
  const selectedDayStats = dailyStats.find(d => d.day === selectedDate) || {
    day: selectedDate,
    completed: 0,
    pending: 0,
  };
  
  const totalSelected = selectedDayStats.completed + selectedDayStats.pending;
  const pieSeries = [selectedDayStats.completed, selectedDayStats.pending];

  const pieOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
      foreColor: '#94a3b8',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    labels: ['Sudah Polling', 'Belum Polling'],
    colors: ['#10b981', '#ef4444'], // Emerald, Red
    stroke: {
      show: true,
      colors: ['#0f172a'], // matches bg
      width: 2,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              fontWeight: 500,
              color: '#94a3b8',
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
              offsetY: 5,
              formatter: (val) => val.toString(),
            },
            total: {
              show: true,
              label: 'Total Sales',
              color: '#94a3b8',
              fontSize: '10px',
              fontWeight: 500,
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + '%';
      },
      style: {
        fontSize: '11px',
        fontWeight: 600,
      },
      dropShadow: {
        enabled: false,
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      labels: {
        colors: '#f8fafc',
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val) => `${val} Sales`,
      }
    }
  };

  // Leaderboard data
  const sortedLeaders = [...leaderStats].sort((a, b) => b.completionRate - a.completionRate);
  const leaderNames = sortedLeaders.map(l => l.leaderName);
  const leaderRates = sortedLeaders.map(l => l.completionRate);

  const leaderSeries = [
    {
      name: 'Rasio Polling',
      data: leaderRates,
    },
  ];

  const leaderOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: {
        show: false,
      },
      fontFamily: 'Inter, sans-serif',
      foreColor: '#94a3b8',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: ['#6366f1'], // Indigo
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '50%',
        dataLabels: {
          position: 'right',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val + '%';
      },
      style: {
        colors: ['#f8fafc'],
        fontWeight: 600,
        fontSize: '11px',
      },
      offsetX: 6,
    },
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      categories: leaderNames,
      max: 100,
      labels: {
        formatter: function (val) {
          return val + '%';
        },
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function (val: number) {
          return val + '% kepatuhan';
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Trend Chart and Today's Pie Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Participation Trend Chart */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-md lg:col-span-2">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white">Tren Partisipasi Harian</h4>
            <p className="text-xs text-slate-500">Perbandingan antara jumlah sales yang sudah vs belum mengisi polling</p>
          </div>
          <div className="h-[300px]">
            <Chart options={trendOptions} series={trendSeries} type="bar" height="100%" />
          </div>
        </div>

        {/* Pie (Donut) Chart for Selected Date */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-md lg:col-span-1 flex flex-col">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white">Status Polling Tgl {selectedDate}</h4>
            <p className="text-xs text-slate-500">Rasio pengisian polling pada tanggal terpilih</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {totalSelected > 0 ? (
              <div className="w-full">
                <Chart options={pieOptions} series={pieSeries} type="donut" height={270} />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">Tidak ada data polling untuk tanggal ini</p>
                <p className="text-[10px] text-slate-600 mt-1">Silakan pilih tanggal lain di kalender</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Leader Leaderboard */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/45 p-6 backdrop-blur-md">
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white">Rasio Kepatuhan per Team Leader</h4>
          <p className="text-xs text-slate-500">Rata-rata tingkat polling yang diselesaikan oleh tim di bawah setiap leader</p>
        </div>
        <div className="h-[300px]">
          <Chart options={leaderOptions} series={leaderSeries} type="bar" height="100%" />
        </div>
      </div>
    </div>
  );
};
