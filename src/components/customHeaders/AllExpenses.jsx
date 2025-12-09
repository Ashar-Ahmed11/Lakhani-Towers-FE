import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';

const AllExpenses = () => {
  const { getCustomHeaderRecords, getSalaries } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const history = useHistory();
  const didInitRef = useRef(false);
  const [records, setRecords] = useState([]);
  const [q, setQ] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [recurringOnly, setRecurringOnly] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Initialize from URL
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

  // Reflect to URL
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
        headerType: 'Expense',
        from, to,
        ...(recurringOnly ? { recurring: true, status: statusParam } : { recurring: false })
      });
      let list = [...(chr || [])];
      if (recurringOnly) {
        const sal = await getSalaries({ from, to, status: statusParam });
        const mappedSal = (sal || []).map(s => ({
          _id: s._id,
          amount: Number(s.amount || 0),
          dateOfAddition: s.dateOfCreation || s.createdAt || new Date(),
          header: { headerName: 'Salaries', headerType: 'Expense' },
          purpose: s.purpose || 'Salary',
          month: s.month || [],
          salaryId: s._id,
        }));
        list = [...list, ...mappedSal];
      }
      // Liabilities filter: only Pending or Due overall
      if (recurringOnly && statusFilter === 'liabilities') {
        list = (list || []).filter(r => {
          if (Array.isArray(r.month) && r.month.length > 0) {
            const s = getStatus(r.month);
            return s === 'Pending' || s === 'Due';
          }
          return false;
        });
      }
      setRecords(list);
      setLoading(false);
    })();
  }, [getCustomHeaderRecords, getSalaries, startDate, endDate, recurringOnly, statusFilter]);

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
        <h1 className="display-4" style={{ fontWeight: 900 }}>All Expenses</h1>
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
              <input className="form-check-input" type="checkbox" id="recSwitchEx" checked={recurringOnly} onChange={(e)=>setRecurringOnly(e.target.checked)} />
              <label className="form-check-label" htmlFor="recSwitchEx">Recurring only</label>
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
                window.open(`/pdf/all-expenses?${qs.toString()}`,'_blank');
              }}>Print Records</button>
            </div>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(filtered || []).map((e) => {
                  const editUrl = e.salaryId
                    ? `/dashboard/edit-salary/${e.salaryId}`
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
                            <h6 className="mb-1">{e.header?.headerName || 'Expense'}</h6>
                          </div>
                          {e.subHeader?.subHeaderName ? <div className="text-muted small">Sub Header: {e.subHeader.subHeaderName}</div> : null}
                          <div className="text-muted small">Amount: {e.amount}</div>
                          {getStatus(e.month) ? <div className="text-muted small">Status: {getStatus(e.month)}</div> : null}
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

export default AllExpenses;


