import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';

const AllIncomings = () => {
  const { getCustomHeaderRecords, getMaintenance, getShopMaintenance, getLoans } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const history = useHistory();
  const didInitRef = useRef(false);
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [recurringOnly, setRecurringOnly] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // pending | paid | due

  // Initialize state from URL
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const qs = new URLSearchParams(location.search);
    const rec = qs.get('recurringOnly');
    const stat = qs.get('status');
    const from = qs.get('from');
    const to = qs.get('to');
    if (rec !== null) setRecurringOnly(rec === 'true');
    if (stat) setStatusFilter(stat);
    if (from) setStartDate(new Date(from));
    if (to) setEndDate(new Date(to));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect filters to URL
  useEffect(() => {
    const qs = new URLSearchParams();
    qs.set('recurringOnly', String(recurringOnly));
    if (recurringOnly && statusFilter !== 'all') qs.set('status', statusFilter);
    if (startDate) qs.set('from', new Date(startDate).toISOString());
    if (endDate) qs.set('to', new Date(endDate).toISOString());
    history.replace({ pathname: location.pathname, search: `?${qs.toString()}` });
  }, [recurringOnly, statusFilter, startDate, endDate, history, location.pathname]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const from = startDate ? new Date(startDate).toISOString() : undefined;
      const to = endDate ? new Date(endDate).toISOString() : undefined;
      const mapStatus = { pending: 'Pending', paid: 'Paid', due: 'Due' };
      const statusParam = statusFilter !== 'all' && statusFilter !== 'liabilities' ? (mapStatus[statusFilter] || statusFilter) : undefined;
      const chr = await getCustomHeaderRecords({
        headerType: 'Incoming',
        from, to,
        ...(recurringOnly ? { recurring: true, status: statusParam } : { recurring: false })
      });
      const incomingCHR = (chr || []);
      let mappedMaint = [];
      let mappedShopMaint = [];
      let mappedLoans = [];
      if (recurringOnly) {
        const maints = await getMaintenance({ from, to, status: statusParam });
        const shopMaints = await getShopMaintenance({ from, to, status: statusParam });
        // Loan status mapping: Pending loans should appear under "Due"; hide under "Pending"
        let loanStatusFetch;
        if (statusFilter === 'due') loanStatusFetch = 'Pending';
        else if (statusFilter === 'paid') loanStatusFetch = 'Paid';
        else if (statusFilter === 'pending') loanStatusFetch = '__none__';
        const loans = loanStatusFetch === '__none__' ? [] : await getLoans({ from, to, status: loanStatusFetch });
        mappedMaint = (maints || []).map(m => ({
          _id: m._id,
          amount: Number(m.maintenanceAmount || 0),
          dateOfAddition: m.createdAt || m.updatedAt || new Date(),
          header: { headerName: 'Maintanance', headerType: 'Incoming' },
          purpose: m.maintenancePurpose,
          month: m.month || [],
          maintenanceId: m._id
        }));
        mappedShopMaint = (shopMaints || []).map(m => ({
          _id: m._id,
          amount: Number(m.maintenanceAmount || 0),
          dateOfAddition: m.createdAt || m.updatedAt || new Date(),
          header: { headerName: 'Shop Maintenance', headerType: 'Incoming' },
          purpose: m.maintenancePurpose,
          month: m.month || [],
          shopMaintenanceId: m._id
        }));
        mappedLoans = (loans || []).map(l => ({
          _id: l._id,
          amount: Number(l.amount || 0),
          dateOfAddition: l.date || l.createdAt || new Date(),
          header: { headerName: 'Loan', headerType: 'Incoming' },
          purpose: l.purpose,
          loanId: l._id,
          loanStatus: l.status
        }));
      }
      let combined = [...(incomingCHR || []), ...mappedMaint, ...mappedShopMaint, ...mappedLoans]
        .sort((a,b)=>new Date(b.dateOfAddition)-new Date(a.dateOfAddition));
      // Liabilities: show Pending or Due overall
      if (recurringOnly && statusFilter === 'liabilities') {
        combined = combined.filter(r => {
          if (Array.isArray(r.month) && r.month.length > 0) {
            const s = getStatus(r.month);
            return s === 'Pending' || s === 'Due';
          }
          return r.loanStatus === 'Pending';
        });
      }
      setRecords(combined);
      setLoading(false);
    })();
  }, [getCustomHeaderRecords, getMaintenance, getShopMaintenance, getLoans, startDate, endDate, recurringOnly, statusFilter]);

  const filtered = useMemo(() => {
    if (!q) return records;
    const qq = q.toLowerCase();
    return (records || []).filter(r =>
      String(r.amount || '').includes(q) ||
      (r.header?.headerName || '').toLowerCase().includes(qq) ||
      (r.purpose || '').toLowerCase().includes(qq)
    );
  }, [q, records]);

  const getStatus = (months=[]) => {
    if (!Array.isArray(months) || months.length === 0) return null;
    const hasDue = months.some(m => m?.status === 'Due');
    if (hasDue) return 'Due';
    const allPaid = months.every(m => m?.status === 'Paid');
    return allPaid ? 'Paid' : 'Pending';
  };

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>All Incomings</h1>
        <div className=" py-2">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <form onSubmit={(e)=>e.preventDefault()} className="flex-grow-1 me-3">
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e)=>setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search by header, purpose, amount..." />
              </div>
            </form>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <DatePicker className="form-control" selected={startDate} onChange={setStartDate} placeholderText="Start date" dateFormat="dd/MM/yyyy" maxDate={endDate || new Date()} />
              <DatePicker className="form-control" selected={endDate} onChange={setEndDate} placeholderText="End date" dateFormat="dd/MM/yyyy" minDate={startDate} maxDate={new Date()} />
              {(startDate || endDate) ? <button className="btn btn-outline-secondary" onClick={()=>{setStartDate(null); setEndDate(null);}}>Clear</button> : null}
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap">
            <div className="form-check form-switch m-2">
              <input className="form-check-input" type="checkbox" id="recSwitchIn" checked={recurringOnly} onChange={(e)=>setRecurringOnly(e.target.checked)} />
              <label className="form-check-label" htmlFor="recSwitchIn">Recurring only</label>
            </div>
            {recurringOnly ? (
              <div className="d-flex gap-2">
                <button className={`btn btn-sm ${statusFilter==='all'?'btn-outline-dark':'btn-outline-secondary'}`} onClick={()=>setStatusFilter('all')}>All</button>
                <button className={`btn btn-sm ${statusFilter==='pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatusFilter('pending')}>Pending</button>
                <button className={`btn btn-sm ${statusFilter==='paid'?'btn-success':'btn-outline-success'}`} onClick={()=>setStatusFilter('paid')}>Fully Paid</button>
                <button className={`btn btn-sm ${statusFilter==='due'?'btn-danger':'btn-outline-danger'}`} onClick={()=>setStatusFilter('due')}>Due</button>
                <button className={`btn btn-sm ${statusFilter==='liabilities'?'btn-dark':'btn-outline-dark'}`} onClick={()=>setStatusFilter('liabilities')}>Liabilities</button>
              </div>
            ) : null}
            <div className="ms-auto">
              <button className="btn btn-outline-primary btn-sm" onClick={()=>{
                const qs = new URLSearchParams();
                if (startDate) qs.set('from', new Date(startDate).toISOString());
                if (endDate) qs.set('to', new Date(endDate).toISOString());
                qs.set('recurringOnly', String(recurringOnly));
                if (recurringOnly && statusFilter!=='all') {
                  const map = { pending: 'Pending', paid: 'Paid', due: 'Due' };
                  qs.set('status', map[statusFilter] || statusFilter);
                }
                window.open(`/pdf/all-incomings?${qs.toString()}`,'_blank');
              }}>Print Records</button>
            </div>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(filtered || []).map((e) => {
                  const editUrl = e.shopMaintenanceId
                    ? `/dashboard/edit-shop-maintenance/${e.shopMaintenanceId}`
                    : e.maintenanceId
                      ? `/dashboard/edit-maintenance/${e.maintenanceId}`
                      : e.loanId
                        ? `/dashboard/edit-loan/${e.loanId}`
                        : `/dashboard/custom-headers/${e.header?._id}/edit-record/${e._id}`;
                  return (
                  <div key={e._id} className="col-12">
                    <div
                      className="card border-0 shadow-sm p-2"
                      style={{ cursor: 'pointer' }}
                      onClick={()=> window.open(editUrl, '_blank')}
                    >
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-grow-1">
                          {e.purpose ? <div className="text-muted small">Purpose: {e.purpose}</div> : null}
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="mb-1">{e.header?.headerName || 'Incoming'}</h6>
                          </div>
                          {e.subHeader?.subHeaderName ? <div className="text-muted small">Sub Header: {e.subHeader.subHeaderName}</div> : null}
                          <div className="text-muted small">Amount: {e.amount}</div>
                          {getStatus(e.month) ? <div className="text-muted small">Status: {getStatus(e.month)}</div> : (e.loanStatus ? <div className="text-muted small">Status: {e.loanStatus}</div> : null)}
                          <div className="text-muted small">On: {new Date(e.dateOfAddition).toLocaleDateString()}</div>
                        </div>
                        <div className="text-end" style={{ minWidth: '160px' }}>
                          <Link
                            to={editUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-dark btn-sm"
                            onClick={(ev)=>ev.stopPropagation()}
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default AllIncomings;


