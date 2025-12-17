import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';

const ElectricityBillsPage = () => {
  const { getElectricityBills, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();
  const [list, setList] = useState([]);
  const [me, setMe] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(location.search);
  const initialFrom = params.get('from') ? new Date(params.get('from')) : null;
  const initialTo = params.get('to') ? new Date(params.get('to')) : null;
  const [startDate, setStartDate] = useState(initialFrom);
  const [endDate, setEndDate] = useState(initialTo);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
      const from = startDate ? new Date(startDate).toISOString() : undefined;
      const to = endDate ? new Date(endDate).toISOString() : undefined;
      const data = await getElectricityBills({ from, to, q });
      setList(data || []);
      setLoading(false);
    })();
  }, [getElectricityBills, startDate, endDate, q, getAdminMe]);

  const applyFilters = useMemo(() => {
    const fromTime = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
    const toTime = endDate ? new Date(endDate).setHours(23,59,59,999) : null;
    const res = (list || []).filter((item) => {
      const t = item?.createdAt ? new Date(item.createdAt).getTime() : null;
      if (fromTime && (!t || t < fromTime)) return false;
      if (toTime && (!t || t > toTime)) return false;
      return true;
    });
    if (!q) return res;
    return res.filter((item) =>
      String(item.consumerNumber||'').toLowerCase().includes(String(q||'').toLowerCase())
    );
  }, [list, startDate, endDate, q]);

  useEffect(() => { setFiltered(applyFilters || []); }, [applyFilters]);

  const filterBySearch = (e) => { e.preventDefault(); setFiltered(applyFilters || []); };

  const pushUrl = (next = {}) => {
    const p = new URLSearchParams(location.search);
    if ('from' in next) { if (next.from) p.set('from', next.from.toISOString()); else p.delete('from'); }
    if ('to' in next) { if (next.to) p.set('to', next.to.toISOString()); else p.delete('to'); }
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
        <h1 className="display-4" style={{ fontWeight: 900 }}>Electricity Bills</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <form onSubmit={filterBySearch}>
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e) => setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search consumer number" />
                <div className="px-2">
                  <button style={{ cursor: 'pointer', border: 'none', backgroundColor: "#fafafa" }} className='fa fa-search fa-lg'></button>
                </div>
              </div>
            </form>
            <div>
              <Link to='/dashboard/create-electricity-bill' onClick={(e)=>{ if(me && (typeof me.editRole==='boolean') && me.editRole===false){ e.preventDefault(); } }}>
                <button style={{ borderColor: "#F4B92D", color: '#F4B92D' }} className="btn rounded-circle" disabled={me && (typeof me.editRole==='boolean') && me.editRole===false}>
                  <i className="fa fa-plus "></i>
                </button>
              </Link>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <DatePicker className="form-control" selected={startDate} onChange={(d)=>{ setStartDate(d); pushUrl({ from: d }); }} placeholderText="Start date" dateFormat="dd/MM/yy" maxDate={endDate || new Date()} />
            <DatePicker className="form-control" selected={endDate} onChange={(d)=>{ setEndDate(d); pushUrl({ to: d }); }} placeholderText="End date" dateFormat="dd/MM/yy" minDate={startDate} maxDate={new Date()} />
            <button className="btn btn-outline-dark ms-auto" onClick={()=>{
              const qs = new URLSearchParams();
              if (startDate) qs.set('from', startDate.toISOString());
              if (endDate) qs.set('to', endDate.toISOString());
              window.open(`/pdf/electricity-bills${qs.toString() ? `?${qs.toString()}` : ''}`, '_blank');
            }}>Print</button>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(filtered || []).map((e,i) => (
                  <div key={e._id} className="col-12">
                    <div className="card border-0 shadow-sm p-2" style={{ cursor: 'pointer' }} onClick={()=> window.open(`/dashboard/edit-electricity-bill/${e._id}`, '_blank')}>
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between flex-column">
                            <h6 className="mb-1 fw-bold">Account #{i+1}</h6>
                            <h6 className="mb-1">Consumer #{e.consumerNumber}</h6>
                          </div>
                          <div className="small fw-bold">
                            Monthly Bill: {fmt(e?.BillRecord?.MonthlyBill)}
                            {/* {' '}| Payables: {fmt(e?.BillRecord?.Payables?.amount)} ({d2(e?.BillRecord?.Payables?.fromDate)} - {d2(e?.BillRecord?.Payables?.toDate)}) */}
                            {' '}| Monthly Payables: {fmt(e?.BillRecord?.monthlyPayables?.amount)}
                            {/* {' '}| Paid: {fmt(e?.BillRecord?.paidAmount)} */}
                          </div>
                        </div>
                        <div className="text-end" style={{ minWidth: '110px' }}>
                          <Link to={`/dashboard/edit-electricity-bill/${e._id}`} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm" onClick={(ev)=>ev.stopPropagation()}>Edit</Link>
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

export default ElectricityBillsPage;


