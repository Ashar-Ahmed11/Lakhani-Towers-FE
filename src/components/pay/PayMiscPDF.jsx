import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const PayMiscPDF = () => {
  const { getMiscExpenseById, getReceipts } = useContext(AppContext);
  const location = useLocation();
  const { toPDF, targetRef } = usePDF({ filename: 'Misc-Expense-Receipt.pdf', resolution: Resolution.HIGH });
  const params = new URLSearchParams(location.search);
  const miscId = params.get('miscId');
  const amount = Number(params.get('amount') || 0);
  const date = params.get('date') ? new Date(params.get('date')) : new Date();
  const [item, setItem] = useState(null);
  useEffect(()=>{ (async()=> setItem(miscId ? await getMiscExpenseById(miscId) : null))(); }, [miscId, getMiscExpenseById]);
  const ddmmyy = useMemo(()=>{ const d = date; const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yy=String(d.getFullYear()).slice(-2); return `${dd}/${mm}/${yy}`; }, [date]);
  const slug = useMemo(()=> `${location.pathname}${location.search}`, [location.pathname, location.search]);
  const [sn, setSn] = useState(null);
  useEffect(()=>{ (async()=>{
    const data = await getReceipts({ slugExact: slug });
    const r = Array.isArray(data) && data.length > 0 ? data[0] : null;
    setSn(r?.serialNumber || null);
  })(); }, [getReceipts, slug]);
  const sn5 = sn ? String(sn).padStart(5,'0') : '-';

  const rows = [
    { label: `Miscellaneous: ${item?.lineItem || ''}`, val: amount },
    { label: 'Rupees', val: 0 },
  ];
  const total = rows.reduce((s,r)=> s + Number(r.val||0), 0);

  return (
    <HelmetProvider>
      <div className="container text-center"><button className="btn btn-outline-primary my-3" onClick={()=>toPDF()}>Download PDF</button></div>
      <div ref={targetRef} style={{ maxWidth: 900, margin: '0 auto', background:'#fff', color:'#000', padding: 20 }}>
        <div className="text-center mb-2">
          <img src={logo} alt="Lakhani Towers" style={{ height: 90 }} />
          <h3 className="m-0" style={{ letterSpacing: 1 }}>LAKHANI TOWERS</h3>
          <div>Maintenance Committee</div>
          <div>258, Garden West, Karachi - 74550</div>
          <div className="fw-bold">PAY YOUR DUES PROMPTLY</div>
        </div>
        <div className="d-flex justify-content-end my-2">
          <div>Date {ddmmyy}</div>
        </div>
        <div className="d-flex justify-content-between my-2">
          <div>Paid To {item?.GivenTo || '-'}</div>
          <div>Expense</div>
          <div>Serial No. {sn5}</div>
        </div>
        <table className="table table-bordered mt-2" style={{ borderCollapse: 'collapse', border: '2px solid #000' }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000' }}>Description</th>
              <th style={{ width: 180, border: '2px solid #000' }}>Date</th>
              <th style={{ width: 180, border: '2px solid #000' }}>Rupees</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{ border: '2px solid #000' }}>{r.label}</td>
                <td style={{ border: '2px solid #000' }}></td>
                <td style={{ border: '2px solid #000' }}>{Number(r.val||0) ? Number(r.val).toLocaleString('en-PK') : ''}</td>
              </tr>
            ))}
            <tr>
              <td className="text-end fw-bold" style={{ border: '2px solid #000' }}>Total</td>
              <td style={{ border: '2px solid #000' }}></td>
              <td className="fw-bold" style={{ border: '2px solid #000' }}>{Number(total).toLocaleString('en-PK')}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-3">
          <div className="fw-bold">Note Before:</div>
          <ol style={{ fontSize: 12, marginBottom: 0 }}>
            <li>Before leaving office check your cash balance and receipt particular in all respect after office staff will be not responsible for any error.</li>
            <li>Any Complain against office staff directly inform to committee members on every Sunday 12:00 noon to 2:00 pm.</li>
            <li>Maintenance dues to be paid before 10th of every month</li>
            <li>For Sale, Purchase or Rental obtained NOC for Maintenance office.</li>
            <li>Use lifts at your risk, children under 12 are not allowed to use lift alone.</li>
          </ol>
        </div>
        <div className="d-flex justify-content-end mt-4">
          <div className="text-end">
            <div>For Lakhani Towers</div>
            <div>Maintenance Committee</div>
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default PayMiscPDF;


