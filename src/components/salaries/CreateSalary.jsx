import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateSalary = () => {
  const { getEmployees, createSalary, uploadImage, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [me, setMe] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [employee, setEmployee] = useState(null);

  const [amount, setAmount] = useState('');
  const [dateOfCreation, setDateOfCreation] = useState(new Date());
  const [documentImages, setDocumentImages] = useState([]);

  const [month, setMonth] = useState([]); // array of { status, amount, occuranceDate }

  useEffect(() => {
    (async () => {
      const m = await getAdminMe(); setMe(m || null); if (m && m.role === 'manager' && m.editRole === false) return history.push('/dashboard');
      const list = await getEmployees();
      setEmployees(list || []);
    })();
  }, [getEmployees, getAdminMe, history]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (employees || []).filter(e =>
      e.employeeName?.toLowerCase().includes(q.toLowerCase())
      || String(e.employeePhone || '').includes(q)
    ).slice(0, 5);
    setResults(filtered);
  };

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try{
      setLoading(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev=>[...prev, ...urls]);
    }catch{
      toast.error('Upload failed');
    }finally{
      setLoading(false);
    }
  };

  const addMonth = () => setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }]);
  const removeMonth = (i) => setMonth(month.filter((_,idx)=>idx!==i));

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const payload = {
        employee: employee?._id,
        documentImages: documentImages.map(url => ({ url })),
        amount: Number(amount || 0),
        dateOfCreation,
        month: month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate })),
      };
      const created = await createSalary(payload);
      if (created?._id){
        toast.success('Record created');
        // reset form
        setEmployee(null);
        setAmount('');
        setDateOfCreation(new Date());
        setDocumentImages([]);
        setMonth([]);
        setSearch(''); setResults([]);
      } else throw new Error('Create failed');
    }catch(err){
      toast.error(err?.message || 'Error creating salary');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-6">Create Salary</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Employee</h5>
        {!employee && (
          <>
            <input value={search} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search employee..." />
            {search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(e => (
                  <li key={e._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setEmployee(e); setSearch(''); setResults([]); }}>
                    {e.employeeName} - {e.employeePhone}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {employee && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{employee.employeeName} ({employee.employeePhone})</span>
              <button type="button" className="btn-close" onClick={()=>setEmployee(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">Amount</h5>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="form-control" placeholder="Amount" />

        <h5 className="mt-3">Date Of Creation</h5>
        <DatePicker dateFormat="dd/MM/yyyy" className='form-control' selected={dateOfCreation} onChange={(date) => setDateOfCreation(date)} />

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

        <h5 className="mt-3">Document Images</h5>
        <div className="input-group mb-3">
          <input onChange={uploadDocs} type="file" className="form-control" multiple />
          <label className="input-group-text">Upload</label>
          {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {documentImages.map((url, idx)=>(
            <div key={idx} className="position-relative">
              <img src={url} alt="doc" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <span onClick={()=>setDocumentImages(documentImages.filter((_,i)=>i!==idx))} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button disabled={loading || (me && (typeof me.editRole==='boolean') && me.editRole===false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Salary'}
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateSalary;


