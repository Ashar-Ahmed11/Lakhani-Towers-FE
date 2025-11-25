import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CustomHeaderPage = () => {
  const { customHeaders, getCustomHeaderRecords, getAdminMe } = useContext(AppContext);
  const { id } = useParams();
  const header = customHeaders.find(h => h._id === id);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
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
    if (!q) return records;
    return (records || []).filter(r => String(r.amount || '').includes(q));
  }, [q, records]);
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
          <DatePicker className="form-control" selected={startDate} onChange={setStartDate} placeholderText="Start date" dateFormat="dd/MM/yyyy" maxDate={endDate || new Date()} />
          <DatePicker className="form-control" selected={endDate} onChange={setEndDate} placeholderText="End date" dateFormat="dd/MM/yyyy" minDate={startDate} maxDate={new Date()} />
          {(startDate || endDate) ? <button className="btn btn-outline-secondary" onClick={()=>{setStartDate(null); setEndDate(null);}}>Clear</button> : null}
          <Link
            to={`/dashboard/custom-headers/${id}/create-record`}
            className={`btn btn-outline-success ${me && me.role==='manager' && me.editRole===false ? 'disabled' : ''}`}
            onClick={(e)=>{ if(me && me.role==='manager' && me.editRole===false){ e.preventDefault(); } }}
          >Create Record</Link>
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

      <h4 className="mt-4">Records</h4>
      <div className="row g-3">
        {filtered.map(r => (
          <div key={r._id} className="col-12">
            <div className="card border-0 shadow-sm p-2">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  {r.purpose ? <div className="text-muted small">Purpose: {r.purpose}</div> : null}
                  <div className="fw-semibold">Amount: {r.amount}</div>
                  {getStatus(r.month) ? <div className="text-muted small">Status: {getStatus(r.month)}</div> : null}
                  <div className="text-muted small">On: {new Date(r.dateOfAddition).toLocaleDateString()}</div>
                </div>
                <div>
                  <Link className="btn btn-sm btn-outline-dark" to={`/dashboard/custom-headers/${id}/edit-record/${r._id}`}>Edit</Link>
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


