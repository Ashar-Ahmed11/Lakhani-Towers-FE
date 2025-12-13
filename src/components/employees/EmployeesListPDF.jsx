import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const EmployeesListPDF = () => {
  const { getEmployees } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({ filename: 'Employees-Payables.pdf', resolution: Resolution.HIGH });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') ? new Date(params.get('from')) : null;
  const to = params.get('to') ? new Date(params.get('to')) : null;
  const status = params.get('status') || 'all'; // all | due | payables | paid

  useEffect(() => {
    (async()=>{
      setLoading(true);
      setList(await getEmployees() || []);
      setLoading(false);
    })();
  }, [getEmployees]);

  const samts = (e) => {
    const sr = e?.salaryRecord || {};
    const payables = Number(sr?.Payables?.amount || 0);
    const monthly = Number(sr?.monthlyPayables?.amount || 0);
    const loan = Number(sr?.loan?.amount || 0);
    return { payables, monthly, loan, payTotal: payables + monthly, allZero: (payables + monthly + loan) === 0 };
  };

  const rows = useMemo(()=>{
    const fromTime = from ? new Date(from).setHours(0,0,0,0) : null;
    const toTime = to ? new Date(to).setHours(23,59,59,999) : null;
    const res = (list||[]).filter(e=>{
      const t = e?.createdAt ? new Date(e.createdAt).getTime() : null;
      if (fromTime && (!t || t < fromTime)) return false;
      if (toTime && (!t || t > toTime)) return false;
      const { payables, monthly, loan, payTotal, allZero } = samts(e);
      if (status === 'due') return loan > 0;
      if (status === 'payables') return payTotal > 0;
      if (status === 'paid') return allZero;
      return true;
    }).map((e,i)=>{
      const { payables, monthly, loan } = samts(e);
      const total = payables + monthly + loan;
      return { no: String(i+1).padStart(2,'0'), name: e.employeeName, payables, monthly, loan, total };
    });
    return res;
  }, [list, from, to, status]);

  const totals = useMemo(()=>{
    return rows.reduce((s,r)=>({
      payables: s.payables + Number(r.payables||0),
      monthly: s.monthly + Number(r.monthly||0),
      loan: s.loan + Number(r.loan||0),
      total: s.total + Number(r.total||0),
    }), { payables:0, monthly:0, loan:0, total:0 });
  }, [rows]);

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const fmt = (n) => Number(n||0).toLocaleString('en-PK');
  const ddmmyy = (()=>{ const d = new Date(); const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=String(d.getFullYear()).slice(-2); return `${dd}/${mm}/${yy}`; })();

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>
      <div className="container text-center"><button className="btn btn-outline-primary my-3" onClick={()=>toPDF()}>Download PDF</button></div>
      <div ref={targetRef} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px" }} className="shadow-lg rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">Employees Payables/Loans</div>
          <img src={logo} alt="Lakhani Towers" style={{ height: 60 }} />
          <div>{ddmmyy}</div>
        </div>
        <table className="table table-bordered mt-2" style={{ borderCollapse: 'collapse', border: '2px solid #000' }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000' }}>Employee Name</th>
              <th style={{ border: '2px solid #000' }}>Payables</th>
              <th style={{ border: '2px solid #000' }}>Monthly Payables</th>
              <th style={{ border: '2px solid #000' }}>Loan</th>
              <th style={{ border: '2px solid #000' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.name}>
                <td style={{ border: '2px solid #000' }}>{r.name}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.payables)}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.monthly)}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.loan)}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.total)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ border: '2px solid #000' }}><strong>Totals</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.payables)}</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.monthly)}</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.loan)}</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </HelmetProvider>
  );
};

export default EmployeesListPDF;


