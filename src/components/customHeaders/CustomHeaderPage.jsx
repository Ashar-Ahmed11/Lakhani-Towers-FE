import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CustomHeaderPage = () => {
  const { customHeaders, getCustomHeaderRecords, createCustomHeaderRecord, deleteCustomHeaderRecord, getAdminMe, getUsers } = useContext(AppContext);
  const { id } = useParams();
  const header = customHeaders.find(h => h._id === id);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [user, setUser] = useState(null);

  const [amount, setAmount] = useState('');
  const [dateOfAddition, setDateOfAddition] = useState(new Date());
  const [documentImages, setDocumentImages] = useState([]);

  const [month, setMonth] = useState([]); // only when recurring

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await getCustomHeaderRecords();
      setRecords((list || []).filter(r => r.header === id || r.header?._id === id));
      const us = await getUsers(); setUsers(us || []);
      const me = await getAdminMe(); setAdmin(me || null);
      setLoading(false);
    })();
  }, [id, getCustomHeaderRecords, getUsers, getAdminMe]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (users || []).filter(u => (u.userName || '').toLowerCase().includes(q.toLowerCase()) || String(u.userMobile||'').includes(q)).slice(0,5);
    setResults(filtered);
  };

  const addMonth = () => setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }]);
  const removeMonth = (i) => setMonth(month.filter((_,idx)=>idx!==i));

  const onCreate = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const base = {
        header: id,
        documentImages: documentImages.map(url => ({ url })),
        amount: Number(amount||0),
        dateOfAddition,
      };
      let payload = { ...base };
      if (header.headerType === 'Expense') {
        payload = { ...payload, fromAdmin: admin?._id || null, toUser: user?._id || null };
      } else {
        payload = { ...payload, fromUser: user?._id || null, toAdmin: admin?._id || null };
      }
      if (header.recurring) payload.month = month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate }));
      const created = await createCustomHeaderRecord(payload);
      if (created?._id){
        toast.success('Record created');
        const list = await getCustomHeaderRecords();
        setRecords((list || []).filter(r => r.header === id || r.header?._id === id));
        setUser(null); setAmount(''); setDocumentImages([]); setMonth([]);
      } else throw new Error('Create failed');
    }catch(err){
      toast.error(err?.message || 'Error creating record');
    }finally{
      setLoading(false);
    }
  };

  if (!header) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-6">{header.headerName}</h1>
      <p className="text-muted">Type: {header.headerType} | Recurring: {header.recurring ? 'Yes' : 'No'}</p>

      <form onSubmit={onCreate}>
        <h5 className="mt-3">{header.headerType === 'Expense' ? 'To User' : 'From User'}</h5>
        {!user && (
          <>
            <input value={search} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search user..." />
            {search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(u => (
                  <li key={u._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setUser(u); setSearch(''); setResults([]); }}>
                    {u.userName} - {u.userMobile}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {user && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{user.userName} ({user.userMobile})</span>
              <button type="button" className="btn-close" onClick={()=>setUser(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">Amount</h5>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="form-control" placeholder="Amount" />

        {header.recurring && (
          <>
            <h5 className="mt-3">Months</h5>
            <button type="button" className="btn btn-sm btn-outline-primary mb-2" onClick={addMonth}>+ Add Month</button>
            {month.map((m,i)=>(
              <div key={i} className="card rounded-3 my-2 p-2">
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                  <select className="form-select w-auto" value={m.status} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, status:e.target.value}:x))}>
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Due</option>
                  </select>
                  <input className="form-control w-auto" type="number" value={m.amount} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, amount:e.target.value}:x))} placeholder="Amount" />
                  <DatePicker dateFormat="dd/MM/yyyy" className='form-control w-auto' selected={new Date(m.occuranceDate)} onChange={(date)=>setMonth(month.map((x,idx)=>idx===i?{...x, occuranceDate:date}:x))} />
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeMonth(i)}>×</button>
                </div>
              </div>
            ))}
          </>
        )}

        <h5 className="mt-3">Date Of Addition</h5>
        <DatePicker dateFormat="dd/MM/yyyy" className='form-control' selected={dateOfAddition} onChange={(date) => setDateOfAddition(date)} />

        <div className="d-flex justify-content-end mt-3">
          <button disabled={loading} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Record'}</button>
        </div>
      </form>

      <h4 className="mt-4">Records</h4>
      <div className="row g-3">
        {records.map(r => (
          <div key={r._id} className="col-12">
            <div className="card border-0 shadow-sm p-2">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold">Amount: {r.amount}</div>
                  <div className="text-muted small">On: {new Date(r.dateOfAddition).toLocaleDateString()}</div>
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


