import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CustomHeaderPage = () => {
  const { customHeaders, getCustomHeaderRecords, getAdminMe, getSubHeaders } = useContext(AppContext);
  const { id } = useParams();
  const header = customHeaders.find(h => h._id === id);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [me, setMe] = useState(null);
  const [subHeaders, setSubHeaders] = useState([]);
  const [subHeaderFilter, setSubHeaderFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setMe(await getAdminMe()); } catch {}
      const from = startDate ? new Date(startDate).toISOString() : undefined;
      const to = endDate ? new Date(endDate).toISOString() : undefined;
      const mapStatus = { pending: 'Pending', paid: 'Paid', due: 'Due' };
      const statusParam = statusFilter !== 'all' ? (mapStatus[statusFilter] || statusFilter) : undefined;
      const list = await getCustomHeaderRecords({
        headerType: header?.headerType,
        ...(header?.recurring ? { status: statusParam, recurring: true } : {}),
        from, to
      });
      setRecords((list || []).filter(r => r.header === id || r.header?._id === id));
      setLoading(false);
    })();
  }, [id, header, getCustomHeaderRecords, startDate, endDate, statusFilter, getAdminMe]);

  const filtered = useMemo(() => {
    let out = records || [];
    if (subHeaderFilter !== 'all') out = out.filter(r => (r.subHeader?._id || r.subHeader) === subHeaderFilter);
    if (!q) return out;
    return out.filter(r => String(r.amount || '').includes(q));
  }, [q, records, subHeaderFilter]);

  useEffect(() => {
    (async () => {
      try {
        const list = await getSubHeaders({ headerId: id });
        setSubHeaders(Array.isArray(list) ? list : []);
      } catch {}
    })();
  }, [id, getSubHeaders]);
  const getStatus = (months=[]) => {
    if (!Array.isArray(months) || months.length === 0) return null;
    const hasDue = months.some(m => m?.status === 'Due');
    if (hasDue) return 'Due';
    const allPaid = months.every(m => m?.status === 'Paid');
    return allPaid ? 'Paid' : 'Pending';
  };

  if (loading || !header) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>{header.headerName}</h1>
      <p className="text-muted">Type: {header.headerType} | Recurring: {header.recurring ? 'Yes' : 'No'}</p>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <form onSubmit={(e)=>e.preventDefault()} className="flex-grow-1 me-3">
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control" placeholder="Search by amount..." />
        </form>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <DatePicker className="form-control" selected={startDate} onChange={setStartDate} placeholderText="Start date" dateFormat="dd/MM/yy" maxDate={endDate || new Date()} />
          <DatePicker className="form-control" selected={endDate} onChange={setEndDate} placeholderText="End date" dateFormat="dd/MM/yy" minDate={startDate} maxDate={new Date()} />
          {(startDate || endDate) ? <button className="btn btn-outline-secondary" onClick={()=>{setStartDate(null); setEndDate(null);}}>Clear</button> : null}
          <Link
            to={`/dashboard/custom-headers/${id}/create-record`}
            className={`btn btn-outline-success ${me && (typeof me.editRole==='boolean') && me.editRole===false ? 'disabled' : ''}`}
            onClick={(e)=>{ if(me && (typeof me.editRole==='boolean') && me.editRole===false){ e.preventDefault(); } }}
          >Create Record</Link>
          {(() => {
            const qs = new URLSearchParams();
            if (startDate) qs.set('from', new Date(startDate).toISOString());
            if (endDate) qs.set('to', new Date(endDate).toISOString());
            if (header?.headerType) qs.set('headerType', header.headerType);
            if (header?.recurring) {
              qs.set('recurring', 'true');
              const mapStatus = { pending: 'Pending', paid: 'Paid', due: 'Due' };
              if (statusFilter !== 'all') qs.set('status', mapStatus[statusFilter] || statusFilter);
            }
            if (subHeaderFilter !== 'all') qs.set('subHeaderId', subHeaderFilter);
            const url = `/pdf/custom-headers/${id}${qs.toString() ? `?${qs.toString()}` : ''}`;
            return <a className="btn btn-secondary" href={url} target="_blank" rel="noreferrer">Print Records</a>;
          })()}
        </div>
      </div>
      {header?.recurring ? (
        <div className="d-flex gap-2 mb-3">
          <button className={`btn btn-sm ${statusFilter==='all'?'btn-outline-dark':'btn-outline-secondary'}`} onClick={()=>setStatusFilter('all')}>All</button>
          <button className={`btn btn-sm ${statusFilter==='pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatusFilter('pending')}>Pending</button>
          <button className={`btn btn-sm ${statusFilter==='paid'?'btn-success':'btn-outline-success'}`} onClick={()=>setStatusFilter('paid')}>Fully Paid</button>
          <button className={`btn btn-sm ${statusFilter==='due'?'btn-danger':'btn-outline-danger'}`} onClick={()=>setStatusFilter('due')}>Due</button>
        </div>
      ) : null}

      <div className="mb-3" style={{ maxWidth: 320 }}>
        <label className="form-label mb-1">Filter by Sub Header</label>
        <select value={subHeaderFilter} onChange={(e)=>setSubHeaderFilter(e.target.value)} className="form-select">
          <option value="all">All</option>
          {subHeaders.map(s => <option key={s._id} value={s._id}>{s.subHeaderName}</option>)}
        </select>
      </div>

      <h4 className="mt-4">Records</h4>
      <div className="row g-3">
        {filtered.map(r => (
          <div key={r._id} className="col-12">
            <div
              className="card border-0 shadow-sm p-2"
              style={{ cursor: 'pointer' }}
              onClick={()=> window.open(`/dashboard/custom-headers/${id}/edit-record/${r._id}`, '_blank')}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  {r.purpose ? <div className="text-muted small">Purpose: {r.purpose}</div> : null}
                  <div className="fw-semibold">Amount: {r.amount}</div>
                  {r.subHeader?.subHeaderName ? <div className="text-muted small">Sub Header: {r.subHeader.subHeaderName}</div> : null}
                  {getStatus(r.month) ? <div className="text-muted small">Status: {getStatus(r.month)}</div> : null}
                  <div className="text-muted small">On: {new Date(r.dateOfAddition).toLocaleDateString()}</div>
                </div>
                <div>
                  <Link className="btn btn-sm btn-outline-dark" to={`/dashboard/custom-headers/${id}/edit-record/${r._id}`} target="_blank" rel="noreferrer" onClick={(ev)=>ev.stopPropagation()}>Edit</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default CustomHeaderPage;


