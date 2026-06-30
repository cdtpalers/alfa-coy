import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

function useContainerWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const measure = useCallback(() => {
    if (ref.current) setWidth(ref.current.offsetWidth);
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);
  const setRef = useCallback(node => {
    ref.current = node;
    if (node) setWidth(node.offsetWidth);
  }, []);
  return [setRef, width];
}

const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '₱0.00';
  return '₱' + parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function FinanceDashboard() {
  const [lineChartRef, lineChartWidth] = useContainerWidth();
  
  const [ledgerData, setLedgerData] = useState([]);
  const [trackerData, setTrackerData] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ledgerFilter, setLedgerFilter] = useState('All Categories');
  const [ledgerSearch, setLedgerSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ledgerRes, trackerRes, dashboardRes] = await Promise.all([
          fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQIKQFrBgVcm0eZJJEKqdu_wengdLW9fo4fmaZiJyq4DBDCWCgM8nHfPyBVbSkZMVQdy85Tb6gDriQV/pub?gid=1495821086&single=true&output=csv'),
          fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQIKQFrBgVcm0eZJJEKqdu_wengdLW9fo4fmaZiJyq4DBDCWCgM8nHfPyBVbSkZMVQdy85Tb6gDriQV/pub?gid=834856310&single=true&output=csv'),
          fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQIKQFrBgVcm0eZJJEKqdu_wengdLW9fo4fmaZiJyq4DBDCWCgM8nHfPyBVbSkZMVQdy85Tb6gDriQV/pub?gid=1306784777&single=true&output=csv')
        ]);

        const ledgerText = await ledgerRes.text();
        const trackerText = await trackerRes.text();
        const dashboardText = await dashboardRes.text();

        Papa.parse(ledgerText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data.filter(row => row.Date && row.Date.trim() !== '');
            setLedgerData(parsed);
          }
        });

        Papa.parse(trackerText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            // Row 3 (index 2) contains headers: ,SURNAME,INITIALS,JUN,JUL,AUG...
            // Data starts at row 4 (index 3)
            const rows = results.data;
            if (rows.length > 2) {
              const headers = rows[2];
              const dataRows = rows.slice(3).map(row => {
                const obj = {};
                headers.forEach((h, i) => {
                  if (h) obj[h.trim()] = row[i];
                });
                return obj;
              }).filter(row => row.SURNAME);
              setTrackerData(dataRows);
            }
          }
        });

        Papa.parse(dashboardText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedDash = {};
            results.data.forEach(row => {
              const reserveIndex = row.indexOf('Reserve Fund');
              if (reserveIndex !== -1 && row.length > reserveIndex + 1) {
                const val = row[reserveIndex + 1];
                if (val) {
                  parsedDash.reserveFund = parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
                }
              }
            });
            setDashboardData(parsedDash);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching finance data:", err);
        setError("Failed to load finance data.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── DERIVED METRICS ───
  const metrics = useMemo(() => {
    let totalExpenses = 0;
    let totalIncome = 0;
    let currentBalance = 0;
    let reserveFund = dashboardData.reserveFund || 0;
    let receiptPending = 0;
    let receiptCompleted = 0;
    let receiptMissing = 0;

    const allocations = {
      'Operational': 0, 'Emergency': 0, 'Athletics': 0, 'Academic/Admin': 0, 'Welfare': 0, 'Coy Fund': 0
    };

    if (ledgerData.length > 0) {
      ledgerData.forEach(row => {
        const credit = parseFloat((row['Credit (OUT)'] || '').replace(/,/g, '')) || 0;
        const debit = parseFloat((row['Debit (IN)'] || '').replace(/,/g, '')) || 0;
        const balance = parseFloat((row['Running Balance'] || '').replace(/,/g, '')) || 0;
        
        totalExpenses += credit;
        totalIncome += debit;
        
        if (balance) currentBalance = balance;

        if (credit > 0) {
          const status = (row['Receipt Status'] || '').toLowerCase();
          if (status.includes('completed')) receiptCompleted++;
          else if (status.includes('no receipt')) receiptMissing++;
          else receiptPending++;

          const cat = (row['Category'] || '').trim();
          if (allocations[cat] !== undefined) {
            allocations[cat] += credit;
          }
        }
      });
    }

    const allocTotal = Object.values(allocations).reduce((a, b) => a + b, 0);

    return {
      totalExpenses, totalIncome, currentBalance, reserveFund,
      receiptCompleted, receiptPending, receiptMissing,
      allocations, allocTotal
    };
  }, [ledgerData, dashboardData]);

  // ─── LINE CHART DATA ───
  const chartData = useMemo(() => {
    if (!ledgerData.length) return [];
    
    const dailyMap = {};
    ledgerData.forEach(row => {
      const d = row['Date'];
      if (!d) return;
      if (!dailyMap[d]) dailyMap[d] = { name: d, Income: 0, Expenses: 0, Balance: 0 };
      
      const credit = parseFloat((row['Credit (OUT)'] || '').replace(/,/g, '')) || 0;
      const debit = parseFloat((row['Debit (IN)'] || '').replace(/,/g, '')) || 0;
      const balance = parseFloat((row['Running Balance'] || '').replace(/,/g, '')) || 0;
      
      dailyMap[d].Income += debit;
      dailyMap[d].Expenses += credit;
      if (balance) dailyMap[d].Balance = balance; 
    });

    const sortedDates = Object.keys(dailyMap).sort((a, b) => new Date(a) - new Date(b));
    
    let accIncome = 0;
    let accExpenses = 0;
    
    return sortedDates.map(date => {
      accIncome += dailyMap[date].Income;
      accExpenses += dailyMap[date].Expenses;
      return {
        name: date,
        Income: accIncome,
        Expenses: accExpenses,
        Balance: dailyMap[date].Balance
      };
    });
  }, [ledgerData]);

  // ─── COLLECTION METRICS ───
  const collectionStats = useMemo(() => {
    let collected = 0;
    let pending = 0;
    let exempted = 0;
    
    trackerData.forEach(row => {
      const colsToCheck = ['MAR', 'APR', 'MAY', 'JUNE', 'JULY'];
      colsToCheck.forEach(col => {
        const val = (row[col] || '').toLowerCase();
        if (val === 'paid') collected++;
        else if (val.includes('due') || val === 'unpaid' || val === 'partial') pending++;
        else if (val === 'exempted' || val === '-') exempted++;
      });
    });

    const totalExpected = collected + pending;
    const rate = totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0;

    return { collected, pending, exempted, rate };
  }, [trackerData]);

  const receiptData = [
    { name: 'Completed', value: metrics.receiptCompleted, color: '#43a047' },
    { name: 'Pending', value: metrics.receiptPending, color: '#fb8c00' },
    { name: 'No Receipt', value: metrics.receiptMissing, color: '#eb5757' }
  ].filter(d => d.value > 0);

  const filteredLedger = useMemo(() => {
    return ledgerData.filter(row => {
      if (ledgerFilter !== 'All Categories' && row['Category'] !== ledgerFilter) return false;
      if (ledgerSearch) {
        const q = ledgerSearch.toLowerCase();
        return (row['Description'] || '').toLowerCase().includes(q) || (row['Requested By'] || '').toLowerCase().includes(q);
      }
      return true;
    }).slice().reverse();
  }, [ledgerData, ledgerFilter, ledgerSearch]);

  if (loading) return <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>Loading financial data...</div>;
  if (error) return <div className="glass" style={{ padding: '40px', textAlign: 'center', color: '#eb5757' }}>{error}</div>;

  return (
    <div style={{ marginTop: '16px', color: 'var(--text)' }}>
      {/* ── METRICS BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="nexus-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Reserve Fund</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Share Tech Mono', monospace" }}>{formatCurrency(metrics.reserveFund)}</div>
          </div>
          <div style={{ background: 'rgba(67, 160, 71, 0.1)', color: '#43a047', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <i className="fa-solid fa-piggy-bank"></i>
          </div>
        </div>
        <div className="nexus-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Balance</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Share Tech Mono', monospace" }}>{formatCurrency(metrics.currentBalance)}</div>
          </div>
          <div style={{ background: 'rgba(30, 136, 229, 0.1)', color: '#1e88e5', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <i className="fa-solid fa-wallet"></i>
          </div>
        </div>
        <div className="nexus-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Expenses</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Share Tech Mono', monospace" }}>{formatCurrency(metrics.totalExpenses)}</div>
          </div>
          <div style={{ background: 'rgba(235, 87, 87, 0.1)', color: '#eb5757', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <i className="fa-solid fa-money-bill-transfer"></i>
          </div>
        </div>
        <div className="nexus-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Collection Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Share Tech Mono', monospace" }}>{collectionStats.rate}%</div>
          </div>
          <div style={{ background: 'rgba(67, 160, 71, 0.1)', color: '#43a047', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <i className="fa-solid fa-arrow-trend-up"></i>
          </div>
        </div>
      </div>

      {/* ── CHARTS & ALLOCATION ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* LINE CHART */}
        <div className="nexus-card" ref={lineChartRef} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>Financial Overview</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#43a047' }}></div> Income</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#eb5757' }}></div> Expenses</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#5e35b1' }}></div> Balance</span>
            </div>
          </div>
          
          <div style={{ flex: 1, minHeight: '250px' }}>
            {lineChartWidth > 0 && chartData.length > 0 ? (
              <LineChart width={lineChartWidth - 48} height={250} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `₱${v/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
                  formatter={(value) => [formatCurrency(value)]}
                />
                <Line type="monotone" dataKey="Income" stroke="#43a047" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Expenses" stroke="#eb5757" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Balance" stroke="#5e35b1" strokeWidth={3} dot={false} />
              </LineChart>
            ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Not enough data for chart.</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Income</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#43a047' }}>{formatCurrency(metrics.totalIncome)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Expenses</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#eb5757' }}>{formatCurrency(metrics.totalExpenses)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ending Balance</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{formatCurrency(metrics.currentBalance)}</div>
            </div>
          </div>
        </div>

        {/* FUND ALLOCATION */}
        <div className="nexus-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0' }}>Fund Allocation</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Cumulative usage per category</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.entries(metrics.allocations).map(([category, amount], idx) => {
              const pct = metrics.allocTotal > 0 ? Math.round((amount / metrics.allocTotal) * 100) : 0;
              const barColor = ['#43a047', '#eb5757', '#fb8c00', '#1e88e5', '#8e24aa', '#00acc1'][idx % 6];
              return (
                <div key={category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{category}</span>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace" }}>{formatCurrency(amount)} <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{pct}%</span></span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--surface-active)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontWeight: 600 }}>
            <span>Total Allocated</span>
            <span style={{ fontFamily: "'Share Tech Mono', monospace" }}>{formatCurrency(metrics.allocTotal)}</span>
          </div>
        </div>

      </div>

      {/* ── RECENT TRANSACTIONS & COMPLIANCE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div className="nexus-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Recent Transactions</h3>
          </div>
          <div>
            {ledgerData.slice().reverse().slice(0, 5).map((row, i) => {
              const dParts = row['Date'].split('-'); // e.g. 17-May-26
              const status = (row['Receipt Status'] || '').toLowerCase();
              let statusTag = { bg: 'rgba(235,87,87,0.1)', color: '#eb5757', text: 'No Receipt' };
              if (status.includes('completed')) statusTag = { bg: 'rgba(67,160,71,0.1)', color: '#43a047', text: 'Completed' };
              else if (status.includes('pending')) statusTag = { bg: 'rgba(251,140,0,0.1)', color: '#fb8c00', text: 'Pending' };

              return (
                <div key={i} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ background: '#eb5757', color: '#fff', borderRadius: '8px', padding: '6px 10px', textAlign: 'center', minWidth: '45px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{dParts[1] || 'M'}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: 1 }}>{dParts[0] || 'D'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{row['Description']}</span>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface-active)', color: 'var(--text-muted)' }}>{row['Category']}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Requested by: {row['Requested By']}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>Amount: {formatCurrency((row['Credit (OUT)'] || row['Debit (IN)'] || '').replace(/,/g,''))}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: statusTag.bg, color: statusTag.color }}>
                    {statusTag.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0' }}>Receipt Compliance</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
            <div style={{ width: '160px', height: '160px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={receiptData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                    {receiptData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--card-bg)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {receiptData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: d.color }}></div>
                  <span style={{ fontWeight: 600 }}>{Math.round((d.value / Math.max(1, (metrics.receiptCompleted + metrics.receiptPending + metrics.receiptMissing))) * 100)}%</span> {d.name}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '24px', textAlign: 'center' }}>
             <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Completed</div>
               <div style={{ fontSize: '18px', fontWeight: 700 }}>{metrics.receiptCompleted}</div>
             </div>
             <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Pending</div>
               <div style={{ fontSize: '18px', fontWeight: 700 }}>{metrics.receiptPending}</div>
             </div>
             <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>No Receipt</div>
               <div style={{ fontSize: '18px', fontWeight: 700 }}>{metrics.receiptMissing}</div>
             </div>
          </div>
        </div>

      </div>

      {/* ── COMPANY FUND COLLECTION TABLE ── */}
      <div className="nexus-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px 0' }}>Company Fund Collection (Monthly)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>Progress <div style={{ width: '100px', height: '6px', background: 'var(--surface-active)', borderRadius: '3px' }}><div style={{ width: `${collectionStats.rate}%`, height: '100%', background: '#43a047', borderRadius: '3px' }}></div></div> <span style={{ fontWeight: 700, color: 'var(--text)' }}>{collectionStats.rate}%</span></div>
              <div style={{ color: '#43a047' }}>Collected <strong style={{fontSize:'14px'}}>{collectionStats.collected}</strong></div>
              <div style={{ color: '#fb8c00' }}>Pending <strong style={{fontSize:'14px'}}>{collectionStats.pending}</strong></div>
              <div style={{ color: '#eb5757' }}>Exempted <strong style={{fontSize:'14px'}}>{collectionStats.exempted}</strong></div>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
          <table className="nexus-table">
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface-active)' }}>
                <th>Cadet</th>
                <th>March</th>
                <th>April</th>
                <th>May</th>
                <th>June</th>
                <th>July</th>
              </tr>
            </thead>
            <tbody>
              {trackerData.map((row, i) => {
                const renderCell = (val) => {
                  if (!val || val === '-') return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                  const v = val.toLowerCase();
                  if (v.includes('paid')) return <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: 'rgba(67,160,71,0.1)', color: '#43a047' }}>Paid</span>;
                  if (v.includes('partial')) return <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: 'rgba(251,140,0,0.1)', color: '#fb8c00' }}>Partial</span>;
                  return <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: 'rgba(235,87,87,0.1)', color: '#eb5757' }}>{val}</span>;
                };

                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {row['SURNAME']}, {row['INITIALS']}
                    </td>
                    <td>{renderCell(row['MAR'])}</td>
                    <td>{renderCell(row['APR'])}</td>
                    <td>{renderCell(row['MAY'])}</td>
                    <td>{renderCell(row['JUNE'])}</td>
                    <td>{renderCell(row['JULY'])}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MASTER LEDGER TABLE ── */}
      <div className="nexus-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Master Ledger</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={ledgerFilter} onChange={e => setLedgerFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-active)', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
            >
              <option>All Categories</option>
              {Object.keys(metrics.allocations).map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-search" style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontSize: '12px' }}></i>
              <input 
                type="text" placeholder="Search ledger..." value={ledgerSearch} onChange={e => setLedgerSearch(e.target.value)}
                style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-active)', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table className="nexus-table">
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface-active)' }}>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Requested By</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((row, i) => {
                const amtStr = row['Credit (OUT)'] || row['Debit (IN)'] || '';
                const amt = parseFloat(amtStr.replace(/,/g, ''));
                const isOut = !!row['Credit (OUT)'];
                
                const status = (row['Receipt Status'] || '').toLowerCase();
                let statusTag = { bg: 'transparent', color: 'inherit', text: row['Receipt Status'] || '-' };
                if (status.includes('completed')) statusTag = { bg: 'rgba(67,160,71,0.1)', color: '#43a047', text: 'Completed' };
                else if (status.includes('pending')) statusTag = { bg: 'rgba(251,140,0,0.1)', color: '#fb8c00', text: 'Pending' };
                else if (status.includes('no receipt')) statusTag = { bg: 'rgba(235,87,87,0.1)', color: '#eb5757', text: 'No Receipt' };

                return (
                  <tr key={i}>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{row['Date']}</td>
                    <td style={{ fontWeight: 600 }}>{row['Description']}</td>
                    <td><span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: 'var(--surface-active)' }}>{row['Category']}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: "'Share Tech Mono', monospace", fontWeight: 600, color: isOut ? '#eb5757' : '#43a047' }}>
                      {isOut ? '-' : '+'}{formatCurrency(amt)}
                    </td>
                    <td style={{ fontSize: '13px' }}>{row['Requested By']}</td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: statusTag.bg, color: statusTag.color }}>
                        {statusTag.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredLedger.length === 0 && (
                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
