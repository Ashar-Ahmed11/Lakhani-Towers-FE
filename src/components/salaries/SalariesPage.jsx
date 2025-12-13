import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SalariesPage = () => {
  const { getSalaries, getAdminMe } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [me, setMe] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
      const from = startDate ? new Date(startDate).toISOString() : undefined;
      const to = endDate ? new Date(endDate).toISOString() : undefined;
      const mapStatus = { pending: 'Pending', paid: 'Paid', due: 'Due' };
      const statusParam = statusFilter !== 'all' ? (mapStatus[statusFilter] || statusFilter) : undefined;
      const data = await getSalaries({ from, to, status: statusParam });
      setList(data || []);
      setLoading(false);
    })();
  }, [getSalaries, startDate, endDate, statusFilter, getAdminMe]);

  const getStatus = (months=[]) => {
    if (!Array.isArray(months) || months.length === 0) return null;
    const hasDue = months.some(m => m?.status === 'Due');
    if (hasDue) return 'Due';
    const allPaid = months.every(m => m?.status === 'Paid');
    return allPaid ? 'Paid' : 'Pending';
  };

  useEffect(() => {
    let upd = [...(list || [])];
    if (q) {
      upd = upd.filter((item) => (item.employee?.employeeName || '').toLowerCase().includes(q.toLowerCase()));
    }
    setFiltered(upd);
  }, [q, list]);

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>Salaries</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <form onSubmit={(e)=>e.preventDefault()} className="flex-grow-1 me-3">
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e) => setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search by employee..." />
              </div>
            </form>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <DatePicker className="form-control" selected={startDate} onChange={setStartDate} placeholderText="Start date" dateFormat="dd/MM/yy" maxDate={endDate || new Date()} />
              <DatePicker className="form-control" selected={endDate} onChange={setEndDate} placeholderText="End date" dateFormat="dd/MM/yy" minDate={startDate} maxDate={new Date()} />
              {(startDate || endDate) ? <button className="btn btn-outline-secondary" onClick={()=>{setStartDate(null); setEndDate(null);}}>Clear</button> : null}
            </div>
            <div>
              <Link
                to='/dashboard/create-salary'
                onClick={(e)=>{ if(me && (typeof me.editRole==='boolean') && me.editRole===false){ e.preventDefault(); } }}
              >
                <button
                  style={{ borderColor: "#F4B92D", color: '#F4B92D' }}
                  className="btn rounded-circle"
                  disabled={me && (typeof me.editRole==='boolean') && me.editRole===false}
                >
                  <i className="fas fa-plus "></i>
                </button>
              </Link>
            </div>
          </div>

          <div className="d-flex gap-2 mb-3 flex-wrap">
            <button className={`btn btn-sm ${statusFilter==='all'?'btn-outline-dark':'btn-outline-secondary'}`} onClick={()=>setStatusFilter('all')}>All</button>
            <button className={`btn btn-sm ${statusFilter==='pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatusFilter('pending')}>Pending</button>
            <button className={`btn btn-sm ${statusFilter==='paid'?'btn-success':'btn-outline-success'}`} onClick={()=>setStatusFilter('paid')}>Nil</button>
            <button className={`btn btn-sm ${statusFilter==='due'?'btn-danger':'btn-outline-danger'}`} onClick={()=>setStatusFilter('due')}>Due</button>
            <button className="btn btn-sm btn-outline-primary ms-auto" onClick={()=>{
              const qs = new URLSearchParams();
              if (startDate) qs.set('from', new Date(startDate).toISOString());
              if (endDate) qs.set('to', new Date(endDate).toISOString());
              if (statusFilter!=='all') {
                const map = { pending: 'Pending', paid: 'Paid', due: 'Due' };
                qs.set('status', map[statusFilter] || statusFilter);
              }
              window.open(`/pdf/salaries?${qs.toString()}`,'_blank');
            }}>Print Records</button>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(filtered || []).map((e) => (
                  <div key={e._id} className="col-12">
                    <div
                      className="card border-0 shadow-sm p-2"
                      style={{ cursor: 'pointer' }}
                      onClick={()=> window.open(`/dashboard/edit-salary/${e._id}`, '_blank')}
                    >
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="mb-1">{e.employee?.employeeName || 'Employee'}</h6>
                          </div>
                          <div className="text-muted small">Amount: {e.amount}</div>
                          {getStatus(e.month) ? <div className="text-muted small">Status: {getStatus(e.month)}</div> : null}
                        </div>
                        <div className="text-end" style={{ minWidth: '110px' }}>
                          <Link to={`/dashboard/edit-salary/${e._id}`} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm" onClick={(ev)=>ev.stopPropagation()}>Edit</Link>
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

export default SalariesPage;


