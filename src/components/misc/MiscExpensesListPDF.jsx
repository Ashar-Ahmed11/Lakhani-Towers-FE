import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const MiscExpensesListPDF = () => {
  const { getMiscExpenses } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({ filename: 'Misc-Expenses.pdf', resolution: Resolution.HIGH });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') ? new Date(params.get('from')) : null;
  const to = params.get('to') ? new Date(params.get('to')) : null;
  const status = params.get('status') || 'all'; // all | payable | nill

  useEffect(() => {
    (async()=>{
      setLoading(true);
      setList(await getMiscExpenses({ from: from?from.toISOString():undefined, to: to?to.toISOString():undefined }) || []);
      setLoading(false);
    })();
  }, [getMiscExpenses, from, to]);

  const rows = useMemo(()=> {
    const mapped = (list||[]).map(e=>({
      serial: e.serialNumber,
      givenTo: e.GivenTo,
      lineItem: e.lineItem,
      amount: Number(e?.amount||0),
      paid: Number(e?.paidAmount||0),
      date: e?.dateOfCreation ? new Date(e.dateOfCreation) : null,
    }));
    const filtered = mapped.filter(r=>{
      if (status === 'payable') return r.paid < r.amount;
      if (status === 'nill') return r.paid >= r.amount;
      return true;
    });
    return filtered.reverse();
  }, [list, status]);

  const totals = useMemo(()=> rows.reduce((s,r)=>({
    amount: s.amount + r.amount,
    paid: s.paid + r.paid,
  }), { amount:0, paid:0 }), [rows]);

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const fmt = (n) => Number(n||0).toLocaleString('en-PK');
  const d2 = (dt) => {
    if (!dt) return '-';
    const x = new Date(dt);
    const dd = String(x.getDate()).padStart(2, '0');
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    const yy = String(x.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };
  const ddmmyy = (()=>{ const d = new Date(); const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=String(d.getFullYear()).slice(-2); return `${dd}/${mm}/${yy}`; })();

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>
      <div className="container text-center"><button className="btn btn-outline-primary my-3" onClick={()=>toPDF()}>Download PDF</button></div>
      <div ref={targetRef} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px" }} className="shadow-lg rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">Miscellaneous Expenses</div>
          <img src={logo} alt="Lakhani Towers" style={{ height: 60 }} />
          <div>{ddmmyy}</div>
        </div>
        <table className="table table-bordered table-sm mt-2" style={{ borderCollapse: 'collapse', border: '2px solid #000', fontSize: '12px', lineHeight: 1.1 }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000' }}>S.No.</th>
              <th style={{ border: '2px solid #000' }}>Line Item</th>
              <th style={{ border: '2px solid #000' }}>Given To</th>
              <th style={{ border: '2px solid #000' }}>Amount</th>
              <th style={{ border: '2px solid #000' }}>Paid</th>
              <th style={{ border: '2px solid #000' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{ border: '2px solid #000' }}>{r.serial || '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.lineItem}</td>
                <td style={{ border: '2px solid #000' }}>{r.givenTo}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.amount)}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.paid)}</td>
                <td style={{ border: '2px solid #000' }}>{d2(r.date)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ border: '2px solid #000' }} colSpan={2}><strong>Totals</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.amount)}</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.paid)}</strong></td>
              <td style={{ border: '2px solid #000' }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </HelmetProvider>
  );
};

export default MiscExpensesListPDF;


