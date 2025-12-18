import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const ReceiptsListPDF = () => {
  const { getReceipts } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({ filename: 'Receipts.pdf', resolution: Resolution.HIGH });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') ? new Date(params.get('from')) : null;
  const to = params.get('to') ? new Date(params.get('to')) : null;
  const status = params.get('status') || 'all';

  useEffect(() => {
    (async()=>{
      setLoading(true);
      const type = status === 'paid' ? 'Paid' : status === 'received' ? 'Recieved' : undefined;
      const data = await getReceipts({ from: from?from.toISOString():undefined, to: to?to.toISOString():undefined, type });
      setList(data || []);
      setLoading(false);
    })();
  }, [getReceipts, from, to, status]);

  const rows = useMemo(()=> {
    const filtered = (list||[]).map(r=>({
      model: r.receiptModel,
      type: r.type,
      amount: Number(r?.amount||0),
      date: r?.dateOfCreation ? new Date(r.dateOfCreation) : (r.createdAt ? new Date(r.createdAt) : null),
      slug: r.receiptSlug
    }));
    return filtered.reverse();
  }, [list]);

  const totals = useCallback(() => {
    let paid = 0, received = 0;
    for (const r of rows) {
      if (r.type === 'Paid') paid += r.amount;
      if (r.type === 'Recieved') received += r.amount;
    }
    return { paid, received };
  }, [rows])();

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
  const ddmmyy = (()=>{
    const d = new Date();
    const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).toString().padStart(2,'0'); const yy=String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  })();

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>
      <div className="container text-center"><button className="btn btn-outline-primary my-3" onClick={()=>toPDF()}>Download PDF</button></div>
      <div ref={targetRef} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px" }} className="shadow-lg rounded">
        <div className=" d-flex justify-content-between align-items-center">
          <div className="fw-bold">Receipts</div>
          <img src={logo} alt="Lakhani Towers" style={{ height: 60 }} />
          <div>{ddmmyy}</div>
        </div>
        <table className="table table-bordered mt-2" style={{ borderCollapse: 'collapse', border: '2px solid #000' }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000' }}>Type</th>
              <th style={{ border: '2px solid #000' }}>Model</th>
              <th style={{ border: '2px solid #000' }}>Amount</th>
              <th style={{ border: '2px solid #000' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{ border: '2px solid #000' }}>{r.type}</td>
                <td style={{ border: '2px solid #000' }}>{r.model}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.amount)}</td>
                <td style={{ border: '2px solid #000' }}>{d2(r.date)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ border: '2px solid #000' }} colSpan={2}><strong>Totals</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }} colSpan={2}>
                <div><strong>Paid:</strong> {fmt(totals.paid)}</div>
                <div><strong>Received:</strong> {fmt(totals.received)}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </HelmetProvider>
  );
};

export default ReceiptsListPDF;


