import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateLoan = () => {
  const { getUsers, createLoan, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [toUser, setToUser] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async()=>{
    const m = await getAdminMe(); setMe(m || null); if (m && m.role === 'manager' && m.editRole === false) { history.push('/dashboard'); return; }
    setUsers(await getUsers() || []);
  })(); }, [getUsers, getAdminMe, history]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (users||[]).filter(u =>
      (u.userName||'').toLowerCase().includes(q.toLowerCase()) ||
      String(u.userMobile||'').includes(q)
    ).slice(0,5);
    setResults(filtered);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!toUser?._id) return toast.error('Select user');
    try{
      setLoading(true);
      const created = await createLoan({ to: toUser._id, purpose, amount: Number(amount||0), status, date });
      if (created?._id){
        toast.success('Record created');
        // reset form
        setToUser(null);
        setPurpose('');
        setAmount('');
        setDate(new Date());
        setStatus('Pending');
        setSearch(''); setResults([]);
      } else {
        throw new Error('Create failed');
      }
    }catch(err){
      toast.error(err?.message || 'Create failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Loan</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">To User</h5>
        {!toUser && (
          <>
            <input value={search} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search user..." />
            {search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(u => (
                  <li key={u._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setToUser(u); setSearch(''); setResults([]); }}>
                    {u.userName} - {u.userMobile}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {toUser && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{toUser.userName} ({toUser.userMobile})</span>
              <button type="button" className="btn-close" onClick={()=>setToUser(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">Purpose</h5>
        <input value={purpose} onChange={(e)=>setPurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Amount</h5>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="form-control" placeholder="Amount" type="number" />

        <h5 className="mt-3">Date</h5>
        <DatePicker dateFormat="dd/MM/yyyy" className='form-control' selected={date} onChange={setDate} />

        <h5 className="mt-3">Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn ${status==='Pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatus('Pending')}>Pending</button>
          <button type="button" className={`btn ${status==='Paid'?'btn-success':'btn-outline-success'} ms-2`} onClick={()=>setStatus('Paid')}>Paid</button>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button disabled={loading || (me && (typeof me.editRole==='boolean') && me.editRole===false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Loan'}
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateLoan;





