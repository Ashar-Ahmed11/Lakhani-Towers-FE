import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateCustomHeaderRecord = () => {
  const { id } = useParams();
  const history = useHistory();
  const { customHeaders, getCustomHeaders, getUsers, getCustomHeaderRecords, createCustomHeaderRecord, getAdminMe, uploadImage } = useContext(AppContext);
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [user, setUser] = useState(null);

  const [amount, setAmount] = useState('');
  const [dateOfAddition, setDateOfAddition] = useState(new Date());
  const [purpose, setPurpose] = useState('');
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);

  const [month, setMonth] = useState([]); // only when recurring

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      const meCheck = await getAdminMe();
      if (meCheck && meCheck.role === 'manager' && meCheck.editRole === false) { history.push('/dashboard'); return; }
      let headersList = customHeaders;
      if (!headersList?.length) {
        headersList = await getCustomHeaders();
      }
      const h = (headersList || []).find(x => x._id === id);
      setHeader(h);
      const us = await getUsers(); setUsers(us || []);
      const me = await getAdminMe(); setAdmin(me || null);
      setLoading(false);
    })();
  }, [id]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (users || []).filter(u => (u.userName || '').toLowerCase().includes(q.toLowerCase()) || String(u.userMobile||'').includes(q)).slice(0,5);
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
      const base = {
        header: id,
        purpose,
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
        history.push(`/dashboard/custom-headers/${id}`);
      } else throw new Error('Create failed');
    }catch(err){
      toast.error(err?.message || 'Error creating record');
    }finally{
      setLoading(false);
    }
  };

  if (loading || !header) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Record - {header.headerName}</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Purpose</h5>
        <input value={purpose} onChange={(e)=>setPurpose(e.target.value)} className="form-control" placeholder="Purpose (optional)" />
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
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn ${m.status==='Paid'?'btn-success':'btn-outline-success'}`}
                      onClick={()=>setMonth(month.map((x,idx)=>idx===i?{...x, status: x.status==='Paid'?'Pending':'Paid'}:x))}
                    >Paid</button>
                    <button
                      type="button"
                      className={`btn ${m.status==='Due'?'btn-danger':'btn-outline-secondary'} ms-2`}
                      onClick={()=>setMonth(month.map((x,idx)=>idx===i?{...x, status: x.status==='Due'?'Pending':'Due'}:x))}
                      disabled={m.status==='Paid'}
                    >Due</button>
                  </div>
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

        <h5 className="mt-3">Document Images</h5>
        <div className="input-group mb-3">
          <input onChange={uploadDocs} type="file" className="form-control" multiple />
          <label className="input-group-text">Upload</label>
          {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {documentImages.map((url, idx)=>(
            <div
              key={idx}
              className="position-relative"
              draggable
              onDragStart={()=>setDragFrom(idx)}
              onDragEnter={()=>setDragTo(idx)}
              onDragEnd={()=>{
                if(dragFrom==null || dragTo==null || dragFrom===dragTo) return;
                const next = [...documentImages];
                const [moved] = next.splice(dragFrom,1);
                next.splice(dragTo,0,moved);
                setDocumentImages(next);
                setDragFrom(null); setDragTo(null);
              }}
            >
              <img src={url} alt="doc" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <span onClick={()=>setDocumentImages(documentImages.filter((_,i)=>i!==idx))} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button disabled={loading} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Record'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateCustomHeaderRecord;


