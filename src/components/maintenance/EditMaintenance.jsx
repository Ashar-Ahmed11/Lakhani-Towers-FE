import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditMaintenance = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getMaintenanceById, updateMaintenance, deleteMaintenance, getFlats, getUsers, getAdminMe, uploadImage } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [maintenancePurpose, setMaintenancePurpose] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');

  const [flats, setFlats] = useState([]);
  const [users, setUsers] = useState([]);
  const [flat, setFlat] = useState(null);
  const [fromUser, setFromUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const [month, setMonth] = useState([]);
  const [lumpSum, setLumpSum] = useState('');
  const lumpBaseRef = useRef(null);
  const [me, setMe] = useState(null);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('flat'); // 'flat' or 'user'

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMaintenanceById(id);
      setMaintenancePurpose(data.maintenancePurpose || '');
      setMaintenanceAmount(data.maintenanceAmount || '');
      setFlat(data.flat || null);
      setFromUser(data.from || null);
      setDocumentImages((data.documentImages || []).map(x => x.url));
      setMonth((data.month || []).map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: new Date(m.occuranceDate) })));
      const fs = await getFlats(); setFlats(fs || []);
      const us = await getUsers(); setUsers(us || []);
      const meRes = await getAdminMe(); setAdmin(meRes || null); setMe(meRes || null);
      setLoading(false);
    })();
  }, [id, getMaintenanceById, getFlats, getUsers, getAdminMe]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    if (searchType === 'flat') {
      const filtered = (flats || []).filter(f => (f.flatNumber || '').toLowerCase().includes(q.toLowerCase())).slice(0,5);
      setResults(filtered);
    } else {
      const filtered = (users || []).filter(u => (u.userName || '').toLowerCase().includes(q.toLowerCase()) || String(u.userMobile||'').includes(q)).slice(0,5);
      setResults(filtered);
    }
  };

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try{
      setSaving(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev=>[...prev, ...urls]);
    }catch{
      toast.error('Upload failed');
    }finally{
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      const payload = {
        maintenancePurpose,
        maintenanceAmount,
        documentImages: documentImages.map(url => ({ url })),
        flat: flat?._id || flat,
        from: fromUser?._id || fromUser,
        to: admin?._id || null,
        month: month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate })),
      };
      await updateMaintenance(id, payload);
      toast.success('Maintenance updated');
    }catch(err){
      toast.error(err?.message || 'Update failed');
    }finally{
      setSaving(false);
    }
  };

  const persistMonths = async (next) => {
    try{
      setSaving(true);
      await updateMaintenance(id, {
        maintenancePurpose,
        maintenanceAmount,
        documentImages: documentImages.map(url => ({ url })),
        flat: flat?._id || flat,
        from: fromUser?._id || fromUser,
        to: admin?._id || null,
        month: next.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate })),
      });
    }finally{
      setSaving(false);
    }
  };

  const addMonth = () => setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }]);
  const removeMonth = (i) => setMonth(month.filter((_,idx)=>idx!==i));

  const onLumpSumChange = (value) => {
    setLumpSum(value);
    if (month.length === 0) return;
    if (value === '' || value == null) {
      if (lumpBaseRef.current) {
        const base = lumpBaseRef.current;
        setMonth(prev => prev.map((m,i)=> i===prev.length-1 ? { ...m, amount: Number(base[base.length-1]?.amount || 0) } : m));
      }
      lumpBaseRef.current = null;
      return;
    }
    if (!lumpBaseRef.current) {
      lumpBaseRef.current = month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate }));
    }
    const base = lumpBaseRef.current;
    const lastIndex = base.length - 1;
    if (lastIndex < 0) return;
    const L = Number(value || 0);
    if (!Number.isFinite(L) || L < 0) return;
    const sumPendingDue = base.slice(0,lastIndex).reduce((s,m)=> (m.status==='Pending'||m.status==='Due') ? s + Number(m.amount||0) : s, 0);
    const lastBase = Number(base[lastIndex]?.amount || 0);
    const remaining = Math.max(0, lastBase + sumPendingDue - L);
    setMonth(prev => prev.map((m,i)=> i===prev.length-1 ? { ...m, amount: remaining } : m));
  };

  const applyLumpSum = () => {
    if (month.length === 0) return;
    const L = Number(lumpSum || 0);
    if (!Number.isFinite(L) || L <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    const base = lumpBaseRef.current ? lumpBaseRef.current : month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate }));
    const lastIndex = base.length - 1;
    if (lastIndex < 0) return;
    const sumPendingDue = base.slice(0,lastIndex).reduce((s,m)=> (m.status==='Pending'||m.status==='Due') ? s + Number(m.amount||0) : s, 0);
    const lastBase = Number(base[lastIndex]?.amount || 0);
    const allCovered = L >= (sumPendingDue + lastBase);
    const remaining = Math.max(0, lastBase + sumPendingDue - L);
    const next = month.map((m, i) => {
      if (i < lastIndex) {
        if (base[i]?.status==='Pending' || base[i]?.status==='Due') return { ...m, status: 'Paid' };
        return m;
      }
      return { ...m, status: allCovered ? 'Paid' : 'Pending', amount: remaining };
    });
    setMonth(next);
    setLumpSum('');
    lumpBaseRef.current = null;
    persistMonths(next);
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this maintenance?')) return;
    try{
      setDeleting(true);
      await deleteMaintenance(id);
      toast.success('Maintenance deleted');
      history.push('/dashboard/maintenance');
    }catch(err){
      toast.error(err?.message || 'Delete failed');
    }finally{
      setDeleting(false);
    }
  };

  const isAdmin = me && me.email === 'admin@lakhanitowers.com';
  const isManager = me && me.role === 'manager';
  const canEditGeneral = isAdmin || (isManager && me.editRole);
  const canToggleMonths = isAdmin || (isManager && (me.editRole || me.payAllAmounts));
  const canEditAmounts = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canUseLump = isAdmin || (isManager && (me.editRole || me.lumpSumAmounts));
  const canAddMonth = isAdmin || (isManager && me.editRole);
  const canSave = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canDelete = isAdmin;
  const canDeleteMonth = isAdmin || (isManager && me.editRole);

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit Maintanance</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Maintenance Purpose</h5>
        <input disabled={!canEditGeneral} value={maintenancePurpose} onChange={(e)=>setMaintenancePurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Maintenance Amount</h5>
        <input disabled={!canEditAmounts} value={maintenanceAmount} onChange={(e)=>setMaintenanceAmount(e.target.value)} className="form-control" placeholder="Amount" />

        <h5 className="mt-3">Flat</h5>
        {!flat && (
          <>
            <input disabled={!canEditGeneral} value={searchType==='flat'?search:''} onChange={(e)=>{setSearchType('flat'); onSearch(e.target.value)}} className="form-control" placeholder="Search flat..." />
            {searchType==='flat' && search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(f => (
                  <li key={f._id} className="list-group-item" style={{cursor: canEditGeneral ? 'pointer' : 'not-allowed', opacity: canEditGeneral ? 1 : .6}} onClick={()=>{ if(!canEditGeneral) return; setFlat(f); setSearch(''); setResults([]); }}>
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
              <span>Flat {flat.flatNumber || flat}</span>
              <button type="button" className="btn-close" onClick={()=>{ if(!canEditGeneral) return; setFlat(null); }} />
            </div>
          </div>
        )}

        <h5 className="mt-3">From (User)</h5>
        {!fromUser && (
          <>
            <input disabled={!canEditGeneral} value={searchType==='user'?search:''} onChange={(e)=>{setSearchType('user'); onSearch(e.target.value)}} className="form-control" placeholder="Search user..." />
            {searchType==='user' && search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(u => (
                  <li key={u._id} className="list-group-item" style={{cursor: canEditGeneral ? 'pointer' : 'not-allowed', opacity: canEditGeneral ? 1 : .6}} onClick={()=>{ if(!canEditGeneral) return; setFromUser(u); setSearch(''); setResults([]); }}>
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
              <span>{fromUser.userName || fromUser} ({fromUser.userMobile || ''})</span>
              <button type="button" className="btn-close" onClick={()=>{ if(!canEditGeneral) return; setFromUser(null); }} />
            </div>
          </div>
        )}

        <h5 className="mt-3">Document Images</h5>
        <div className="input-group mb-3">
          <input disabled={!canEditGeneral} onChange={uploadDocs} type="file" className="form-control" multiple />
          <label className="input-group-text">Upload</label>
          {saving && <span className="spinner-border spinner-border-sm ms-2"></span>}
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
              <span
                onClick={()=>{ if(!canEditGeneral) return; setDocumentImages(documentImages.filter((_,i)=>i!==idx))}}
                style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor: canEditGeneral ? 'pointer' : 'not-allowed', opacity: canEditGeneral ? 1 : .5 }}
                className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <h5 className="mt-3">Months</h5>
        <button type="button" className="btn btn-sm btn-outline-primary mb-2" onClick={addMonth} disabled={!canAddMonth}>+ Add Month</button>
        {month.map((m,i)=>(
          <div key={i} className="card rounded-3 my-2 p-2">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
              <div className="btn-group">
                <button
                  type="button"
                  className={`btn ${m.status==='Paid'?'btn-success':'btn-outline-success'}`}
                  onClick={()=>{
                    if (!canToggleMonths) return;
                    const next = month.map((x,idx)=>idx===i?{...x, status: x.status==='Paid'?'Pending':'Paid'}:x);
                    setMonth(next);
                    persistMonths(next);
                  }}
                >Paid</button>
                <button
                  type="button"
                  className={`btn ${m.status==='Due'?'btn-danger':'btn-outline-secondary'} ms-2`}
                  onClick={()=>{
                    if (!canToggleMonths) return;
                    const next = month.map((x,idx)=>idx===i?{...x, status: x.status==='Due'?'Pending':'Due'}:x);
                    setMonth(next);
                    persistMonths(next);
                  }}
                  disabled={m.status==='Paid'}
                >Due</button>
              </div>
              <input disabled={!canEditAmounts} className="form-control w-auto" type="number" value={m.amount} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, amount:e.target.value}:x))} placeholder="Amount" />
              <input disabled={!canEditAmounts} className="form-control w-auto" type="date" value={new Date(m.occuranceDate).toISOString().slice(0,10)} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, occuranceDate:new Date(e.target.value)}:x))} />
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeMonth(i)} disabled={!canDeleteMonth}>×</button>
            </div>
          </div>
        ))}
        <div className="d-flex align-items-center gap-2 mt-2">
          <input
            className="form-control w-auto"
            type="number"
            value={lumpSum}
            onChange={(e)=>{ if(!canUseLump) return; onLumpSumChange(e.target.value)}}
            placeholder="Lumpsum amount"
            disabled={!canUseLump}
          />
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={applyLumpSum} disabled={!canUseLump}>Lumpsum</button>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button onClick={onDelete} type="button" disabled={deleting || !canDelete} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <div className="d-flex gap-2">
            <button type="button" disabled={saving} onClick={()=>window.open(`/pdf/maintenance/${id}`,'_blank')} className="btn btn-secondary">
              {saving ? <span className="spinner-border spinner-border-sm"></span> : 'Print'}
            </button>
            <button disabled={saving || !canSave} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
          </div>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditMaintenance;


