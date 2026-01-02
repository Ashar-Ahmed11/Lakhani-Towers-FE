import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const ShopsListPDF = () => {
  const { getShops } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({ filename: 'Shops-Outstandings.pdf', resolution: Resolution.HIGH });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') ? new Date(params.get('from')) : null;
  const to = params.get('to') ? new Date(params.get('to')) : null;
  const status = params.get('status') || 'all';

  useEffect(() => {
    (async()=>{
      setLoading(true);
      setList(await getShops() || []);
      setLoading(false);
    })();
  }, [getShops]);

  const oamts = (s) => {
    const mr = s?.maintenanceRecord || {};
    const other = Number(mr?.OtherOutstandings?.amount || 0);
    const dues = Number(mr?.Outstandings?.amount || 0) + Number(mr?.monthlyOutstandings?.amount || 0);
    const total = other + dues;
    return { other, dues, total };
  };

  const rows = useMemo(()=>{
    const fromTime = from ? new Date(from).setHours(0,0,0,0) : null;
    const toTime = to ? new Date(to).setHours(23,59,59,999) : null;
    const res = (list||[]).filter(s=>{
      const t = s?.createdAt ? new Date(s.createdAt).getTime() : null;
      if (fromTime && (!t || t < fromTime)) return false;
      if (toTime && (!t || t > toTime)) return false;
      const { total } = oamts(s);
      if (status === 'due') return total > 0;
      if (status === 'paid') return total === 0;
      return true;
    }).map((s,i)=>{
      const { other, dues, total } = oamts(s);
      const ownerName = s?.owner?.userName || '';
      const ownerPhone = s?.owner?.userMobile || '';
      const tenantName = s?.tenant?.userName || '';
      const tenantPhone = s?.tenant?.userMobile || '';
      return { no: String(i+1).padStart(2,'0'), shop: s.shopNumber, ownerName, ownerPhone, tenantName, tenantPhone, other, dues, total };
    });
    return res.reverse();
  }, [list, from, to, status]);

  const totals = useMemo(()=>{
    return rows.reduce((s,r)=>({
      other: s.other + Number(r.other||0),
      dues: s.dues + Number(r.dues||0),
      total: s.total + Number(r.total||0),
    }), { other:0, dues:0, total:0 });
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
          <div className="fw-bold">Total Out Standing</div>
          <img src={logo} alt="Lakhani Towers" style={{ height: 60 }} />
          <div>{ddmmyy}</div>
        </div>
        <table className="table table-bordered table-sm mt-2" style={{ borderCollapse: 'collapse', border: '2px solid #000', fontSize: '11px', lineHeight: 1.05 }}>
          <thead>
            <tr>
              <th style={{ border: '2px solid #000' }}>Shop No.</th>
              <th style={{ border: '2px solid #000' }}>Owner Name</th>
              <th style={{ border: '2px solid #000' }}>Owner Phone</th>
              <th style={{ border: '2px solid #000' }}>Tenant Name</th>
              <th style={{ border: '2px solid #000' }}>Tenant Phone</th>
              <th style={{ border: '2px solid #000' }}>Others Dues</th>
              <th style={{ border: '2px solid #000' }}>Dues maintanaince</th>
              <th style={{ border: '2px solid #000' }}>outstanding balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.shop}>
                <td style={{ border: '2px solid #000' }}>{r.shop}</td>
                <td style={{ border: '2px solid #000' }}>{r.ownerName}</td>
                <td style={{ border: '2px solid #000' }}>{r.ownerPhone}</td>
                <td style={{ border: '2px solid #000' }}>{r.tenantName}</td>
                <td style={{ border: '2px solid #000' }}>{r.tenantPhone}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.other)}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.dues)}</td>
                <td style={{ border: '2px solid #000', textAlign:'right' }}>{fmt(r.total)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ border: '2px solid #000' }} colSpan={4}><strong>Total Out Standing</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.other)}</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.dues)}</strong></td>
              <td style={{ border: '2px solid #000', textAlign:'right' }}><strong>{fmt(totals.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </HelmetProvider>
  );
};

export default ShopsListPDF;


