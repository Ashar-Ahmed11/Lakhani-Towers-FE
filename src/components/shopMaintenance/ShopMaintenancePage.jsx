import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';

const ShopMaintenancePage = () => {
  const { getShopMaintenance, getAdminMe } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [me, setMe] = useState(null);
  const [q, setQ] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
      const from = startDate ? new Date(startDate).toISOString() : undefined;
      const to = endDate ? new Date(endDate).toISOString() : undefined;
      const statusParam = status !== 'all' ? (status==='pending'?'Pending':status==='paid'?'Paid':'Due') : undefined;
      const data = await getShopMaintenance({ from, to, status: statusParam, q });
      setList(data || []);
      setLoading(false);
    })();
  }, [getShopMaintenance, startDate, endDate, status, q, getAdminMe]);

  const rows = useMemo(() => list, [list]);
  const getStatus = (months=[]) => {
    if (!Array.isArray(months) || months.length === 0) return 'Pending';
    const hasDue = months.some(m => m?.status === 'Due');
    if (hasDue) return 'Due';
    const allPaid = months.every(m => m?.status === 'Paid');
    return allPaid ? 'Paid' : 'Pending';
  };

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>Shops Maintenance</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <form onSubmit={(e)=>e.preventDefault()} className="flex-grow-1 me-3">
              <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control" placeholder="Search by purpose..." />
            </form>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <DatePicker className="form-control" selected={startDate} onChange={setStartDate} placeholderText="Start date" dateFormat="dd/MM/yyyy" maxDate={endDate || new Date()} />
              <DatePicker className="form-control" selected={endDate} onChange={setEndDate} placeholderText="End date" dateFormat="dd/MM/yyyy" minDate={startDate} maxDate={new Date()} />
              {(startDate || endDate) ? <button className="btn btn-outline-secondary" onClick={()=>{setStartDate(null); setEndDate(null);}}>Clear</button> : null}
              <Link
                to="/dashboard/create-shop-maintenance"
                className={`btn btn-outline-success ${me && me.role==='manager' && me.editRole===false ? 'disabled' : ''}`}
                onClick={(e)=>{ if(me && me.role==='manager' && me.editRole===false){ e.preventDefault(); } }}
              >Create Maintenance</Link>
              <button
                className="btn btn-outline-primary"
                onClick={()=>{
                  const qs = new URLSearchParams();
                  if (startDate) qs.set('from', new Date(startDate).toISOString());
                  if (endDate) qs.set('to', new Date(endDate).toISOString());
                  if (status !== 'all') qs.set('status', status==='pending'?'Pending':status==='paid'?'Paid':'Due');
                  if (q) qs.set('q', q);
                  window.open(`/pdf/shops-maintenance?${qs.toString()}`,'_blank');
                }}
              >Print Records</button>
            </div>
          </div>

          <div className="d-flex gap-2 mb-3">
            <button className={`btn btn-sm ${status==='all'?'btn-outline-dark':'btn-outline-secondary'}`} onClick={()=>setStatus('all')}>All</button>
            <button className={`btn btn-sm ${status==='pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatus('pending')}>Pending</button>
            <button className={`btn btn-sm ${status==='paid'?'btn-success':'btn-outline-success'}`} onClick={()=>setStatus('paid')}>Fully Paid</button>
            <button className={`btn btn-sm ${status==='due'?'btn-danger':'btn-outline-danger'}`} onClick={()=>setStatus('due')}>Due</button>
          </div>

          {loading ? (
            <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
          ) : (
            <div className="row g-3">
              {(rows || []).map((e) => (
                <div key={e._id} className="col-12">
                  <div className="card border-0 shadow-sm p-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold">Purpose: {e.maintenancePurpose}</div>
                        <div className="text-muted small">Shop: {e.shop?.shopNumber} | By: {e.from?.userName} {e.from?.userMobile ? `(${e.from.userMobile})` : ''}</div>
                        <div className="text-muted small">Amount: {e.maintenanceAmount}</div>
                        <div className="text-muted small">Status: {getStatus(e.month)}</div>
                        <div className="text-muted small">Date: {new Date(e.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <Link to={`/dashboard/edit-shop-maintenance/${e._id}`} className="btn btn-sm btn-outline-dark">Edit</Link>
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
  );
};

export default ShopMaintenancePage;



