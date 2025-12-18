import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';

const ReceiptsPage = () => {
  const { getReceipts, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();
  const [list, setList] = useState([]);
  const [me, setMe] = useState(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(location.search);
  const initialFrom = params.get('from') ? new Date(params.get('from')) : null;
  const initialTo = params.get('to') ? new Date(params.get('to')) : null;
  const initialStatus = params.get('status') || 'all'; // all | paid | received
  const [startDate, setStartDate] = useState(initialFrom);
  const [endDate, setEndDate] = useState(initialTo);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
      const from = startDate ? new Date(startDate).toISOString() : undefined;
      const to = endDate ? new Date(endDate).toISOString() : undefined;
      const type = status === 'paid' ? 'Paid' : status === 'received' ? 'Recieved' : undefined;
      const data = await getReceipts({ from, to, q, type });
      setList(data || []);
      setLoading(false);
    })();
  }, [getReceipts, startDate, endDate, q, status, getAdminMe]);

  const rows = useMemo(() => {
    const s = String(q || '').toLowerCase();
    const filtered = (list || []).filter(r => {
      if (status === 'paid' && r.type !== 'Paid') return false;
      if (status === 'received' && r.type !== 'Recieved') return false;
      if (!s) return true;
      return String(r.receiptSlug || '').toLowerCase().includes(s) || String(r.receiptModel||'').toLowerCase().includes(s);
    });
    return filtered;
  }, [list, status, q]);

  const pushUrl = (next = {}) => {
    const p = new URLSearchParams(location.search);
    if ('from' in next) { if (next.from) p.set('from', next.from.toISOString()); else p.delete('from'); }
    if ('to' in next) { if (next.to) p.set('to', next.to.toISOString()); else p.delete('to'); }
    if ('status' in next) { if (next.status) p.set('status', next.status); else p.delete('status'); }
    history.replace({ pathname: location.pathname, search: p.toString() });
  };

  const fmt = (n) => Number(n || 0).toLocaleString('en-PK');
  const d2 = (dt) => {
    if (!dt) return '-';
    const x = new Date(dt);
    const dd = String(x.getDate()).padStart(2, '0');
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    const yy = String(x.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>Receipts</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <form onSubmit={(e)=>{ e.preventDefault(); }}>
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e) => setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search slug / model" />
                <div className="px-2">
                  <button style={{ cursor: 'pointer', border: 'none', backgroundColor: "#fafafa" }} className='fa fa-search fa-lg'></button>
                </div>
              </div>
            </form>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <DatePicker className="form-control" selected={startDate} onChange={(d)=>{ setStartDate(d); pushUrl({ from: d }); }} placeholderText="Start date" dateFormat="dd/MM/yy" maxDate={endDate || new Date()} />
            <DatePicker className="form-control" selected={endDate} onChange={(d)=>{ setEndDate(d); pushUrl({ to: d }); }} placeholderText="End date" dateFormat="dd/MM/yy" minDate={startDate} maxDate={new Date()} />
            <div className="btn-group" role="group" aria-label="status">
              <button type="button" className={`btn btn-${status==='all'?'primary':'outline-primary'}`} onClick={()=>{ setStatus('all'); pushUrl({ status: 'all' }); }}>All</button>
              <button type="button" className={`btn btn-${status==='paid'?'primary':'outline-primary'}`} onClick={()=>{ setStatus('paid'); pushUrl({ status: 'paid' }); }}>Paid</button>
              <button type="button" className={`btn btn-${status==='received'?'primary':'outline-primary'}`} onClick={()=>{ setStatus('received'); pushUrl({ status: 'received' }); }}>Received</button>
            </div>
            <button className="btn btn-outline-dark ms-auto" onClick={()=>{
              const qs = new URLSearchParams();
              if (startDate) qs.set('from', startDate.toISOString());
              if (endDate) qs.set('to', endDate.toISOString());
              if (status) qs.set('status', status);
              window.open(`/pdf/receipts${qs.toString() ? `?${qs.toString()}` : ''}`, '_blank');
            }}>Print</button>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(rows || []).map((r) => (
                  <div key={r._id} className="col-12">
                    <div
                      className="card border-0 shadow-sm p-2"
                      style={{ cursor: 'pointer' }}
                      onClick={()=> window.open(r.receiptSlug, '_blank')}
                    >
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="mb-1">{r.receiptModel} — {r.type}</h6>
                          </div>
                          <div className="small fw-bold">
                            <span style={{ color: r.type==='Paid' ? '#F4B92D' : '#198754' }}>
                              {fmt(r.amount)} PKR
                            </span>
                            {' '}| Date: {d2(r.dateOfCreation || r.createdAt)}
                            {/* {' '}| Slug: {r.receiptSlug} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ReceiptsPage;


