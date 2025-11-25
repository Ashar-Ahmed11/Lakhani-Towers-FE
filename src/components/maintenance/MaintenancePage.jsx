import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MaintenancePage = () => {
  const { getMaintenance, getAdminMe } = useContext(AppContext);
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
      const data = await getMaintenance({ from, to, status: statusParam });
      setList(data || []);
      setFiltered(data || []);
      setLoading(false);
    })();
  }, [getMaintenance, startDate, endDate, statusFilter, getAdminMe]);

  const filterBySearch = (e) => {
    e.preventDefault();
    if (!q) return setFiltered(list);
    const updated = (list || []).filter((item) =>
      item.maintenancePurpose?.toLowerCase().includes(q.toLowerCase())
    );
    setFiltered(updated);
  };

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
        <h1 className="display-4" style={{ fontWeight: 900 }}>Maintanance</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <form onSubmit={filterBySearch} className="flex-grow-1 me-3">
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e) => setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search by purpose..." />
              </div>
            </form>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <DatePicker className="form-control" selected={startDate} onChange={setStartDate} placeholderText="Start date" dateFormat="dd/MM/yyyy" maxDate={endDate || new Date()} />
              <DatePicker className="form-control" selected={endDate} onChange={setEndDate} placeholderText="End date" dateFormat="dd/MM/yyyy" minDate={startDate} maxDate={new Date()} />
              {(startDate || endDate) ? <button className="btn btn-outline-secondary" onClick={()=>{setStartDate(null); setEndDate(null);}}>Clear</button> : null}
            </div>
            <div>
              <Link
                to='/dashboard/create-maintenance'
                onClick={(e)=>{ if(me && me.role==='manager' && me.editRole===false){ e.preventDefault(); } }}
              >
                <button
                  style={{ borderColor: "#F4B92D", color: '#F4B92D' }}
                  className="btn rounded-circle"
                  disabled={me && me.role==='manager' && me.editRole===false}
                >
                  <i className="fas fa-plus "></i>
                </button>
              </Link>
            </div>
          </div>
          <div className="d-flex gap-2 mb-3">
            <button className={`btn btn-sm ${statusFilter==='all'?'btn-outline-dark':'btn-outline-secondary'}`} onClick={()=>setStatusFilter('all')}>All</button>
            <button className={`btn btn-sm ${statusFilter==='pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatusFilter('pending')}>Pending</button>
            <button className={`btn btn-sm ${statusFilter==='paid'?'btn-success':'btn-outline-success'}`} onClick={()=>setStatusFilter('paid')}>Fully Paid</button>
            <button className={`btn btn-sm ${statusFilter==='due'?'btn-danger':'btn-outline-danger'}`} onClick={()=>setStatusFilter('due')}>Due</button>
          </div>
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-outline-primary btn-sm" onClick={()=>{
              const qs = new URLSearchParams();
              if (startDate) qs.set('from', new Date(startDate).toISOString());
              if (endDate) qs.set('to', new Date(endDate).toISOString());
              window.open(`/pdf/maintenances?${qs.toString()}`,'_blank');
            }}>Print Records</button>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(filtered || []).map((e) => (
                  <div key={e._id} className="col-12">
                    <div className="card border-0 shadow-sm p-2">
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="mb-1">{e.maintenancePurpose}</h6>
                          </div>
                          <div className="text-muted small">Amount: {e.maintenanceAmount}</div>
                          <div className="text-muted small">Status: {getStatus(e.month)}</div>
                          <div className="text-muted small">On: {new Date(e.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-end" style={{ minWidth: '110px' }}>
                          <Link to={`/dashboard/edit-maintenance/${e._id}`} className="btn btn-outline-dark btn-sm">Edit</Link>
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

export default MaintenancePage;


