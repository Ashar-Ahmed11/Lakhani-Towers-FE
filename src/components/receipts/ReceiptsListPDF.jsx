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
  const fromStr = params.get('from') || '';
  const toStr = params.get('to') || '';
  const status = params.get('status') || 'all';

  useEffect(() => {
    (async()=>{
      setLoading(true);
      const type = status === 'paid' ? 'Paid' : status === 'received' ? 'Recieved' : undefined;
      const data = await getReceipts({
        from: fromStr || undefined,
        to: toStr || undefined,
        type
      });
      setList(data || []);
      setLoading(false);
    })();
  }, [getReceipts, fromStr, toStr, status]);

  // Backend now populates receiptId; no extra per-row fetches needed

  const rows = useMemo(()=> {
    const filtered = (list||[]).map(r=>({
      serial: Number(r?.serialNumber||0) || null,
      id: r.receiptId?._id || r.receiptId,
      ref: r.receiptId && typeof r.receiptId === 'object' ? r.receiptId : null,
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
      <div ref={targetRef} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px", fontSize: '11px', lineHeight: 1.2 }} className="shadow-lg rounded">
        <div className=" d-flex justify-content-between align-items-center">
          <div className="fw-bold">Receipts</div>
          <img src={logo} alt="Lakhani Towers" style={{ height: 60 }} />
          <div>{ddmmyy}</div>
        </div>
        <table className="table table-sm table-bordered mt-2" style={{ borderCollapse: 'collapse', border: '2px solid #000', fontSize: '10px' }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000' }}>S.No.</th>
              <th style={{ border: '2px solid #000' }}>Type</th>
              <th style={{ border: '2px solid #000' }}>Header</th>
              <th style={{ border: '2px solid #000' }}>Flat Owner</th>
              <th style={{ border: '2px solid #000' }}>Flat Number</th>
              <th style={{ border: '2px solid #000' }}>Shop Owner</th>
              <th style={{ border: '2px solid #000' }}>Shop Name</th>
              <th style={{ border: '2px solid #000' }}>Consumer Number</th>
              <th style={{ border: '2px solid #000' }}>Line Item</th>
              <th style={{ border: '2px solid #000' }}>Employee Name</th>
              <th style={{ border: '2px solid #000' }}>Amount</th>
              <th style={{ border: '2px solid #000' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{ border: '2px solid #000' }}>{r.serial ? String(r.serial).padStart(5,'0') : '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.type}</td>
                <td style={{ border: '2px solid #000' }}>{r.model}</td>
                <td style={{ border: '2px solid #000' }}>{r.model==='Flat' ? (r.ref?.owner?.userName || '-') : '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.model==='Flat' ? (r.ref?.flatNumber || '-') : '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.model==='Shop' ? (r.ref?.owner?.userName || '-') : '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.model==='Shop' ? (r.ref?.shopNumber || '-') : '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.model==='ElectricityBill' ? (r.ref?.consumerNumber || '-') : '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.model==='MiscellaneousExpense' ? (r.ref?.lineItem || '-') : '-'}</td>
                <td style={{ border: '2px solid #000' }}>{r.model==='Salary' ? (r.ref?.employee?.employeeName || '-') : '-'}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.amount)}</td>
                <td style={{ border: '2px solid #000' }}>{d2(r.date)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ border: '2px solid #000' }} colSpan={2}><strong>Totals</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }} colSpan={10}>
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


