import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateMaintenance = () => {
  const { getFlats, getUsers, createMaintenance, getAdminMe, uploadImage } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [maintenancePurpose, setMaintenancePurpose] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [month, setMonth] = useState([]);

  const [flats, setFlats] = useState([]);
  const [users, setUsers] = useState([]);
  const [flat, setFlat] = useState(null);
  const [fromUser, setFromUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('flat'); // 'flat' or 'user'

  useEffect(() => {
    (async () => {
      const me = await getAdminMe(); if (me && me.role === 'manager' && me.editRole === false) return history.push('/dashboard');
      const fs = await getFlats(); setFlats(fs || []);
      const us = await getUsers(); setUsers(us || []);
      const meRes = await getAdminMe(); setAdmin(meRes || null);
    })();
  }, [getFlats, getUsers, getAdminMe]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    if (searchType === 'flat') {
      const filtered = (flats || []).filter(f => f.flatNumber?.toLowerCase().includes(q.toLowerCase())).slice(0,5);
      setResults(filtered);
    } else {
      const filtered = (users || []).filter(u => u.userName?.toLowerCase().includes(q.toLowerCase()) || String(u.userMobile||'').includes(q)).slice(0,5);
      setResults(filtered);
    }
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

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const payload = {
        maintenancePurpose,
        maintenanceAmount,
        month: month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate })),
        documentImages: documentImages.map(url => ({ url })),
        flat: flat?._id,
        from: fromUser?._id,
        to: admin?._id || null,
      };
      const created = await createMaintenance(payload);
      if (created?._id){
        toast.success('Record created');
        // reset form
        setMaintenancePurpose('');
        setMaintenanceAmount('');
        setMonth([]);
        setFlat(null);
        setFromUser(null);
        setDocumentImages([]);
        setSearch(''); setResults([]);
        setSearchType('flat');
      } else throw new Error('Create failed');
    }catch(err){
      toast.error(err?.message || 'Error creating maintenance');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Maintanance</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Maintenance Purpose</h5>
        <input value={maintenancePurpose} onChange={(e)=>setMaintenancePurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Maintenance Amount</h5>
        <input value={maintenanceAmount} onChange={(e)=>setMaintenanceAmount(e.target.value)} className="form-control" placeholder="Amount" />

        <h5 className="mt-3">Flat</h5>
        {!flat && (
          <>
            <input value={searchType==='flat'?search:''} onChange={(e)=>{setSearchType('flat'); onSearch(e.target.value)}} className="form-control" placeholder="Search flat..." />
            {searchType==='flat' && search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(f => (
                  <li key={f._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setFlat(f); setSearch(''); setResults([]); }}>
                    Flat {f.flatNumber}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {flat && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>
                Flat {flat.flatNumber}
                {(() => {
                  const active = flat.activeStatus || 'Owner';
                  let person = null;
                  if (active === 'Owner') {
                    const o = (flat.owners || []).find(x => x.owned) || (flat.owners||[])[0];
                    const id = o?.user?._id || o?.user;
                    person = (users || []).find(u => u._id === id);
                  } else if (active === 'Tenant') {
                    const t = (flat.tenant || []).find(x => x.active) || (flat.tenant||[])[0];
                    const id = t?.user?._id || t?.user;
                    person = (users || []).find(u => u._id === id);
                  }
                  return person ? <span className="ms-2 small">({active}: {person.userName} - {person.userMobile})</span> : <span className="ms-2 small">({active})</span>;
                })()}
              </span>
              <button type="button" className="btn-close" onClick={()=>setFlat(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">From (User)</h5>
        {!fromUser && (
          <>
            <input value={searchType==='user'?search:''} onChange={(e)=>{setSearchType('user'); onSearch(e.target.value)}} className="form-control" placeholder="Search user..." />
            {searchType==='user' && search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(u => (
                  <li key={u._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setFromUser(u); setSearch(''); setResults([]); }}>
                    {u.userName} - {u.userMobile}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {fromUser && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{fromUser.userName} ({fromUser.userMobile})</span>
              <button type="button" className="btn-close" onClick={()=>setFromUser(null)} />
            </div>
          </div>
        )}

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

        <h5 className="mt-3">Months</h5>
        <button type="button" className="btn btn-sm btn-outline-primary mb-2" onClick={()=>setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }])}>+ Add Month</button>
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
              <input className="form-control w-auto" type="date" value={new Date(m.occuranceDate).toISOString().slice(0,10)} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, occuranceDate:new Date(e.target.value)}:x))} />
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>setMonth(month.filter((_,idx)=>idx!==i))}>×</button>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-end mt-4">
          <button disabled={loading || (admin && (typeof admin.editRole==='boolean') && admin.editRole===false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Maintanance'}
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateMaintenance;


