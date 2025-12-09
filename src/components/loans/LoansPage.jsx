import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';

const LoansPage = () => {
  const { getLoans, getAdminMe } = useContext(AppContext);
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
      try { setMe(await getAdminMe()); } catch {}
      const from = startDate ? new Date(startDate).toISOString() : undefined;
      const to = endDate ? new Date(endDate).toISOString() : undefined;
      const s = status !== 'all' ? (status === 'pending' ? 'Pending' : 'Paid') : undefined;
      const data = await getLoans({ from, to, status: s, q });
      setList(data || []);
      setLoading(false);
    })();
  }, [getLoans, startDate, endDate, status, q, getAdminMe]);

  const rows = useMemo(() => list, [list]);

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>Loans</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center">
              <input value={q} onChange={(e)=>setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search purpose/amount" />
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <DatePicker className="form-control" selected={startDate} onChange={setStartDate} placeholderText="Start date" dateFormat="dd/MM/yyyy" maxDate={endDate || new Date()} />
              <DatePicker className="form-control" selected={endDate} onChange={setEndDate} placeholderText="End date" dateFormat="dd/MM/yyyy" minDate={startDate} maxDate={new Date()} />
              {(startDate || endDate) ? <button className="btn btn-outline-secondary" onClick={()=>{setStartDate(null); setEndDate(null);}}>Clear</button> : null}
              <button
                className="btn btn-outline-primary"
                onClick={()=>{
                  const qs = new URLSearchParams();
                  if (startDate) qs.set('from', new Date(startDate).toISOString());
                  if (endDate) qs.set('to', new Date(endDate).toISOString());
                  if (status !== 'all') qs.set('status', status==='pending'?'Pending':'Paid');
                  if (q) qs.set('q', q);
                  window.open(`/pdf/loans?${qs.toString()}`,'_blank');
                }}
              >Print Records</button>
              <Link
                to="/dashboard/create-loan"
                className={`btn btn-outline-success ${me && (typeof me.editRole==='boolean') && me.editRole===false ? 'disabled' : ''}`}
                onClick={(e)=>{ if(me && (typeof me.editRole==='boolean') && me.editRole===false){ e.preventDefault(); } }}
              >Create Loan</Link>
            </div>
          </div>

          <div className="d-flex gap-2 mb-3">
            <button className={`btn btn-sm ${status==='all'?'btn-outline-dark':'btn-outline-secondary'}`} onClick={()=>setStatus('all')}>All</button>
            <button className={`btn btn-sm ${status==='pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatus('pending')}>Pending</button>
            <button className={`btn btn-sm ${status==='paid'?'btn-success':'btn-outline-success'}`} onClick={()=>setStatus('paid')}>Paid</button>
          </div>

          {loading ? (
            <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
          ) : (
            <div className="row g-3">
              {(rows || []).map((e) => (
                <div key={e._id} className="col-12">
                  <div
                    className="card border-0 shadow-sm p-2"
                    style={{ cursor: 'pointer' }}
                    onClick={()=> window.open(`/dashboard/edit-loan/${e._id}`, '_blank')}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small">To: {e.to?.employeeName} {e.to?.employeePhone ? `(${e.to.employeePhone})` : ''}</div>
                        <div className="fw-semibold">Purpose: {e.purpose}</div>
                        <div className="text-muted small">Amount: {e.amount} | Status: {e.status} | Date: {new Date(e.date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <Link to={`/dashboard/edit-loan/${e._id}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark" onClick={(ev)=>ev.stopPropagation()}>Edit</Link>
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

export default LoansPage;



