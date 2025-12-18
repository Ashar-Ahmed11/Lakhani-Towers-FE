import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const ElectricityBillsListPDF = () => {
  const { getElectricityBills } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({ filename: 'Electricity-Bills.pdf', resolution: Resolution.HIGH });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') ? new Date(params.get('from')) : null;
  const to = params.get('to') ? new Date(params.get('to')) : null;
  const status = params.get('status') || 'all'; // all | payables | nill

  useEffect(() => {
    (async()=>{
      setLoading(true);
      setList(await getElectricityBills({ from: from?from.toISOString():undefined, to: to?to.toISOString():undefined }) || []);
      setLoading(false);
    })();
  }, [getElectricityBills, from, to]);

  const rows = useMemo(()=> {
    const mapped = (list||[]).map(b=>({
      consumerNumber: b.consumerNumber,
      monthly: Number(b?.BillRecord?.MonthlyBill||0),
      monthlyPayables: Number(b?.BillRecord?.monthlyPayables?.amount||0),
      paid: Number(b?.BillRecord?.paidAmount||0),
    }));
    const filtered = mapped.filter(r=>{
      if (status === 'payables') return r.monthlyPayables > 0;
      if (status === 'nill') return Number(r.monthlyPayables||0) === 0;
      return true;
    });
    return filtered.reverse();
  }, [list, status]);

  const totals = useMemo(()=> rows.reduce((s,r)=>({
    monthly: s.monthly + r.monthly,
    monthlyPayables: s.monthlyPayables + r.monthlyPayables,
  }), { monthly:0, monthlyPayables:0 }), [rows]);

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const fmt = (n) => Number(n||0).toLocaleString('en-PK');
  const ddmmyy = (()=>{ const d = new Date(); const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=String(d.getFullYear()).slice(-2); return `${dd}/${mm}/${yy}`; })();

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>
      <div className="container text-center"><button className="btn btn-outline-primary my-3" onClick={()=>toPDF()}>Download PDF</button></div>
      <div ref={targetRef} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px" }} className="shadow-lg rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold">Electricity Bills</div>
          <img src={logo} alt="Lakhani Towers" style={{ height: 60 }} />
          <div>{ddmmyy}</div>
        </div>
        <table className="table table-bordered mt-2" style={{ borderCollapse: 'collapse', border: '2px solid #000' }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000' }}>Account No.</th>
              <th style={{ border: '2px solid #000' }}>Consumer No.</th>
              <th style={{ border: '2px solid #000' }}>Monthly Bill</th>
              <th style={{ border: '2px solid #000' }}>Monthly Payables</th>
              <th style={{ border: '2px solid #000' }}>Paid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{ border: '2px solid #000' }}>{`Account#${i+1}`}</td>
                <td style={{ border: '2px solid #000' }}>{r.consumerNumber}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.monthly)}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.monthlyPayables)}</td>
                <td style={{ border: '2px solid #000' }}>{Number(r.monthlyPayables||0) === 0 ? 'Paid' : 'Unpaid'}</td>
              </tr>
            ))}
            <tr>
              <td style={{ border: '2px solid #000' }}><strong>Totals</strong></td>
              <td style={{ border: '2px solid #000' }}></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.monthly)}</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.monthlyPayables)}</strong></td>
              <td style={{ border: '2px solid #000' }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </HelmetProvider>
  );
};

export default ElectricityBillsListPDF;


