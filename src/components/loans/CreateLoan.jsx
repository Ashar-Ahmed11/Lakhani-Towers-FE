import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateLoan = () => {
  const { getEmployees, createLoan, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [employees, setEmployees] = useState([]);
  const [me, setMe] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [toEmployee, setToEmployee] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => { (async()=>{
    setLoadingData(true);
    const m = await getAdminMe(); setMe(m || null); if (m && m.role === 'manager' && m.editRole === false) { history.push('/dashboard'); return; }
    const emps = await getEmployees();
    setEmployees(emps || []);
    setLoadingData(false);
  })(); }, [getEmployees, getAdminMe, history]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (employees||[]).filter(e =>
      (e.employeeName||'').toLowerCase().includes(q.toLowerCase()) ||
      String(e.employeePhone||'').includes(q)
    ).slice(0,5);
    setResults(filtered);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!toEmployee?._id) return toast.error('Select employee');
    try{
      setLoading(true);
      const created = await createLoan({ to: toEmployee._id, purpose, amount: Number(amount||0), status, date });
      if (created?._id){
        toast.success('Record created');
        // reset form
        setToEmployee(null);
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
        <h5 className="mt-3">To Employee</h5>
        {!toEmployee && (
          loadingData ? (
            <div className="my-2 d-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm"></span>
              <span>Loading employees...</span>
            </div>
          ) : (
            <>
              <input value={search} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search employee..." />
              {search.trim() && results.length>0 && (
                <ul className="list-group my-2">
                  {results.map(e => (
                    <li key={e._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setToEmployee(e); setSearch(''); setResults([]); }}>
                      {e.employeeName} - {e.employeePhone}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )
        )}
        {toEmployee && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{toEmployee.employeeName} ({toEmployee.employeePhone})</span>
              <button type="button" className="btn-close" onClick={()=>setToEmployee(null)} />
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
          <button disabled={loading || loadingData || (me && (typeof me.editRole==='boolean') && me.editRole===false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Loan'}
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateLoan;





