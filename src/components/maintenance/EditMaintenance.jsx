import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditMaintenance = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getMaintenanceById, updateMaintenance, deleteMaintenance, getFlats, getAdminMe, uploadImage } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [maintenanceAmount, setMaintenanceAmount] = useState('');

  const [flats, setFlats] = useState([]);
  const [flat, setFlat] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const [month, setMonth] = useState([]);
  const [lumpSum, setLumpSum] = useState('');
  const lumpBaseRef = useRef(null);
  const [me, setMe] = useState(null);
  const [outstanding, setOutstanding] = useState({ amount: 0, status: 'Due', FromDate: new Date(), ToDate: new Date() });
  const [outLump, setOutLump] = useState('');

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('flat'); // flat only

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMaintenanceById(id);
      setMaintenanceAmount(data.maintenanceAmount || '');
      setFlat(data.flat || null);
      setDocumentImages((data.documentImages || []).map(x => x.url));
      setMonth((data.month || []).map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: new Date(m.occuranceDate), paidAmount: Number(m.paidAmount || 0) })));
      if (data.outstanding) {
        setOutstanding({
          amount: Number(data.outstanding.amount || 0),
          status: data.outstanding.status || 'Due',
          FromDate: data.outstanding.FromDate ? new Date(data.outstanding.FromDate) : new Date(),
          ToDate: data.outstanding.ToDate ? new Date(data.outstanding.ToDate) : new Date(),
        });
      } else {
        setOutstanding({ amount: 0, status: 'Due', FromDate: new Date(), ToDate: new Date() });
      }
      const fs = await getFlats(); setFlats(fs || []);
      const meRes = await getAdminMe(); setAdmin(meRes || null); setMe(meRes || null);
      setLoading(false);
    })();
  }, [id, getMaintenanceById, getFlats, getAdminMe]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (flats || []).filter(f => (f.flatNumber || '').toLowerCase().includes(q.toLowerCase())).slice(0,5);
    setResults(filtered);
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
        maintenanceAmount,
        documentImages: documentImages.map(url => ({ url })),
        flat: flat?._id || flat,
        to: admin?._id || null,
        month: month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate, paidAmount: Number(m.paidAmount || 0) })),
        outstanding: {
          amount: Number(outstanding.amount || 0),
          status: outstanding.status,
          FromDate: outstanding.FromDate,
          ToDate: outstanding.ToDate,
        },
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
        maintenanceAmount,
        documentImages: documentImages.map(url => ({ url })),
        flat: flat?._id || flat,
        to: admin?._id || null,
        month: next.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate, paidAmount: Number(m.paidAmount || 0) })),
        outstanding: {
          amount: Number(outstanding.amount || 0),
          status: outstanding.status,
          FromDate: outstanding.FromDate,
          ToDate: outstanding.ToDate,
        },
      });
    }finally{
      setSaving(false);
    }
  };

  const addMonth = () => setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }]);
  const removeMonth = (i) => setMonth(month.filter((_,idx)=>idx!==i));

  const onLumpSumChange = (value) => {
    // Only track the input for display; do not mutate any month values
    setLumpSum(value);
    lumpBaseRef.current = null;
  };

  const applyLumpSum = () => {
    if (month.length === 0) return;
    const base = lumpBaseRef.current ? lumpBaseRef.current : month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate }));
    const lastIndex = base.length - 1;
    if (lastIndex < 0) return;
    const totalDues = base.slice(0,lastIndex).reduce((s,m)=> (m.status==='Due') ? s + Number(m.amount||0) : s, 0);
    const remainingDue = Math.max(0, totalDues - Number(lumpSum || 0));
    // Mark earlier Pending/Due months as Paid (to consolidate into new month)
    let remaining = Number(lumpSum || 0);
    const before = month.slice(0, lastIndex).map((m,i)=>{
      if (base[i]?.status==='Due') {
        const toPay = Math.min(remaining, Number(base[i]?.amount || 0));
        remaining = Math.max(0, remaining - toPay);
        return { ...m, status: 'Paid', paidAmount: Number(toPay) };
      }
      if (base[i]?.status==='Paid') return { ...m, paidAmount: Number(m.paidAmount || Number(m.amount || 0)) };
      return m;
    });
    // Keep last month unchanged
    const lastOriginal = { ...month[lastIndex] };
    // Insert new second-last month with Total Dues; if 0, no insertion
    const next = remainingDue > 0
      ? [...before, { status: 'Due', amount: remainingDue, occuranceDate: new Date(), paidAmount: 0 }, lastOriginal]
      : [...before, lastOriginal];
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

  const isAdmin = !!me && me.email === 'admin@lakhanitowers.com';
  const isManager = !!me && (((me.role || '').toLowerCase() === 'manager') || typeof me.editRole === 'boolean');
  const canEditGeneral = isAdmin || (isManager && me.editRole);
  const canToggleMonths = isAdmin || (isManager && (me.editRole || me.payAllAmounts));
  const canEditAmounts = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canUseLump = isAdmin || (isManager && (me.editRole || me.lumpSumAmounts));
  const canAddMonth = isAdmin || (isManager && me.editRole);
  const canSave = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canDelete = isAdmin;
  const canDeleteMonth = isAdmin || (isManager && me.editRole);
  const totalDue = (month || []).reduce((s, m) => (m.status === 'Due' ? s + Number(m.amount || 0) : s), 0);
  const totalDueAfterLump = Math.max(0, totalDue - Number(lumpSum || 0));

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit Maintenance</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Maintenance Amount</h5>
        <input disabled={!canEditAmounts} value={maintenanceAmount} onChange={(e)=>setMaintenanceAmount(e.target.value)} className="form-control" placeholder="Amount" />

        <h5 className="mt-3">Flat</h5>
        {!flat && (
          <>
            <input disabled={!canEditGeneral} value={search} onChange={(e)=>{ onSearch(e.target.value)}} className="form-control" placeholder="Search flat..." />
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
              <span>
                Flat {flat.flatNumber || flat}
                {(() => {
                  const full = (flats || []).find(f => (f._id === (flat?._id || flat)));
                  if (!full) return null;
                  const active = full.activeStatus || 'Owner';
                  const person = active==='Tenant' ? full.tenant : full.owner;
                  return person ? <span className="ms-2 small">({active}: {person.userName} - {person.userMobile})</span> : <span className="ms-2 small">({active})</span>;
                })()}
              </span>
              <button type="button" className="btn-close" onClick={()=>{ if(!canEditGeneral) return; setFlat(null); }} />
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

        <h5 className="mt-3">Outstanding</h5>
        <div className="border border-1 rounded-3 p-2 ">
          <div className="row g-2 border-1">
            <div className="col-md-3">
              <input disabled={!canEditGeneral} className="form-control" type="number" value={outstanding.amount} onChange={(e)=>setOutstanding({...outstanding, amount: e.target.value})} placeholder="Outstanding amount" />
            </div>
            <div className="col-md-3">
              <div className="btn-group">
                <button type="button" className={`btn btn-${outstanding.status==='Due'?'danger':'outline-danger'}`} onClick={()=>{ if(!canEditGeneral) return; setOutstanding({...outstanding, status:'Due'})}}>Due</button>
                <button type="button" className={`btn btn-${outstanding.status==='Paid'?'success':'outline-success'} ms-2`} onClick={()=>{ if(!canEditGeneral) return; setOutstanding({...outstanding, status:'Paid'})}}>Paid</button>
              </div>
            </div>
            <div className="col-md-3">
              <input disabled={!canEditGeneral} className="form-control" type="date" value={new Date(outstanding.FromDate).toISOString().slice(0,10)} onChange={(e)=>setOutstanding({...outstanding, FromDate: new Date(e.target.value)})} />
            </div>
            <div className="col-md-3">
              <input disabled={!canEditGeneral} className="form-control" type="date" value={new Date(outstanding.ToDate).toISOString().slice(0,10)} onChange={(e)=>setOutstanding({...outstanding, ToDate: new Date(e.target.value)})} />
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 mt-2">
            <input
              className="form-control w-auto"
              type="number"
              value={outLump}
              onChange={(e)=>setOutLump(e.target.value)}
              placeholder="Outstanding lumpsum"
              disabled={!canEditGeneral}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={()=>{
                const v = Number(outLump||0);
                const curr = Number(outstanding.amount||0);
                if (v <= 0 || v >= curr) return;
                setOutstanding({...outstanding, amount: curr - v});
                setOutLump('');
              }}
              disabled={!canEditGeneral || Number(outLump||0) <= 0 || Number(outLump||0) >= Number(outstanding.amount||0)}
            >Lumpsum</button>
          </div>
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
                    toast.success('Status updated');
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
                    toast.success('Status updated');
                  }}
                  disabled={m.status==='Paid'}
                >Due</button>
              </div>
              <input disabled={!canEditAmounts} className="form-control w-auto" type="number" value={m.amount} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, amount:e.target.value}:x))} placeholder="Amount" />
              <input disabled={!canEditAmounts} className="form-control w-auto" type="date" value={new Date(m.occuranceDate).toISOString().slice(0,10)} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, occuranceDate:new Date(e.target.value)}:x))} />
              {m.status==='Paid' ? (
                <button type="button" className="btn btn-sm btn-secondary" onClick={()=>window.open(`/pdf/maintenance/${id}?monthIndex=${i}`,'_blank')}>Print</button>
              ) : null}
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeMonth(i)} disabled={!canDeleteMonth}>×</button>
            </div>
          </div>
        ))}
        <h6 className="mt-2">Total Dues: {totalDueAfterLump}</h6>
        <div className="d-flex align-items-center gap-2 mt-2">
          <input
            className="form-control w-auto"
            type="number"
            value={lumpSum}
            onChange={(e)=>{ if(!canUseLump) return; onLumpSumChange(e.target.value)}}
            placeholder="Lumpsum amount"
            disabled={!canUseLump}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={applyLumpSum}
            disabled={!canUseLump || Number(lumpSum||0) <= 0 || Number(lumpSum||0) >= totalDue}
          >Lumpsum</button>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button onClick={onDelete} type="button" disabled={deleting || !canDelete} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <div className="d-flex gap-2">
            <button disabled={saving || !canSave} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
          </div>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditMaintenance;


