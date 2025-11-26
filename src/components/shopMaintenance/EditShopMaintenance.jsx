import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditShopMaintenance = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getShopMaintenanceById, updateShopMaintenance, deleteShopMaintenance, getShops, getUsers, getAdminMe } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [maintenancePurpose, setMaintenancePurpose] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [shop, setShop] = useState(null);
  const [from, setFrom] = useState(null);
  const [documentImages, setDocumentImages] = useState([]);
  const didInitRef = useRef(false);
  const [showDelete, setShowDelete] = useState(false);
  const [month, setMonth] = useState([]);
  const [lumpSum, setLumpSum] = useState('');
  const lumpBaseRef = useRef(null);
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('shop');

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async()=>{
      const meRes = await getAdminMe(); setMe(meRes || null);
      setShops(await getShops() || []);
      setUsers(await getUsers() || []);
      const m = await getShopMaintenanceById(id);
      if (m){
        setMaintenancePurpose(m.maintenancePurpose || '');
        setMaintenanceAmount(m.maintenanceAmount || '');
        setShop(m.shop || null);
        setFrom(m.from || null);
        setDocumentImages((m.documentImages||[]).map(x => x.url));
        setMonth((m.month || []).map(mm => ({ status: mm.status, amount: Number(mm.amount||0), occuranceDate: new Date(mm.occuranceDate) })));
      }
      setLoading(false);
    })();
  }, [id, getShopMaintenanceById, getShops, getUsers, getAdminMe]);
  const [me, setMe] = useState(null);
  const isAdmin = me && me.email === 'admin@lakhanitowers.com';
  const isManager = me && me.role === 'manager';
  const editLocked = isManager && me && (me.editRole === false);
  const canToggleMonths = isAdmin || (isManager && (me.editRole || me.payAllAmounts || me.payOnlyShopMaintenance));
  const canEditAmounts = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canUseLump = isAdmin || (isManager && (me.editRole || me.lumpSumAmounts));
  const canSave = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canDelete = isAdmin;
  const canAddMonth = isAdmin || (isManager && me.editRole);
  const canDeleteMonth = isAdmin || (isManager && me.editRole);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    if (searchType === 'shop') {
      const filtered = (shops || []).filter(s => (s.shopNumber || '').toLowerCase().includes(q.toLowerCase())).slice(0,5);
      setResults(filtered);
    } else {
      const filtered = (users || []).filter(u => (u.userName || '').toLowerCase().includes(q.toLowerCase()) || String(u.userMobile||'').includes(q)).slice(0,5);
      setResults(filtered);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      await updateShopMaintenance(id, {
        maintenancePurpose,
        maintenanceAmount,
        documentImages: documentImages.map(url => ({ url })),
        shop: shop?._id || shop,
        from: from?._id || from,
        month: month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate })),
      });
      toast.success('Maintenance updated');
    }finally{
      setSaving(false);
    }
  };

  const onDelete = async () => {
    try{
      setDeleting(true);
      await deleteShopMaintenance(id);
      toast.success('Maintenance deleted');
      history.push('/dashboard/shops-maintenance');
    }finally{
      setDeleting(false);
    }
  };

  const persistMonths = async (next) => {
    try{
      setSaving(true);
      await updateShopMaintenance(id, {
        maintenancePurpose,
        maintenanceAmount,
        documentImages: documentImages.map(url => ({ url })),
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

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit Shop Maintenance</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Shop</h5>
        {!shop && (
          <>
            <input value={searchType==='shop'?search:''} onChange={(e)=>{setSearchType('shop'); onSearch(e.target.value)}} className="form-control" placeholder="Search shop..." />
            {searchType==='shop' && search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(s => (
                  <li key={s._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setShop(s); setSearch(''); setResults([]); }}>
                    Shop {s.shopNumber}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {shop && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>Shop {shop.shopNumber || shop}</span>
              <button type="button" className="btn-close" onClick={()=>setShop(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">From (User)</h5>
        {!from && (
          <>
            <input value={searchType==='user'?search:''} onChange={(e)=>{setSearchType('user'); onSearch(e.target.value)}} className="form-control" placeholder="Search user..." />
            {searchType==='user' && search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(u => (
                  <li key={u._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setFrom(u); setSearch(''); setResults([]); }}>
                    {u.userName} - {u.userMobile}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {from && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{from.userName || from} ({from.userMobile || ''})</span>
              <button type="button" className="btn-close" onClick={()=>setFrom(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">Purpose</h5>
        <input disabled={!(isAdmin || (isManager && me.editRole))} value={maintenancePurpose} onChange={(e)=>setMaintenancePurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Amount</h5>
        <input value={maintenanceAmount} onChange={(e)=>setMaintenanceAmount(e.target.value)} className="form-control" placeholder="Amount" type="number" />

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

        <h5 className="mt-3">Document Images</h5>
        <div className="d-flex flex-wrap gap-2">
          {documentImages.map((url, idx)=>(
            <div key={idx} className="position-relative">
              <img src={url} alt="doc" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <span
                onClick={()=>{
                  if (!(isAdmin || (isManager && me.editRole))) return;
                  setDocumentImages(documentImages.filter((_,i)=>i!==idx))
                }}
                style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor: (isAdmin || (isManager && me.editRole)) ? 'pointer' : 'not-allowed', opacity: (isAdmin || (isManager && me.editRole)) ? 1 : .5 }}
                className="d-flex align-items-center justify-content-center"
              >×</span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button type="button" disabled={deleting || !canDelete} onClick={()=>setShowDelete(true)} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving || !canSave} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>

        {showDelete && (
          <div className="modal fade show" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={()=>setShowDelete(false)} />
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this record?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={()=>setShowDelete(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={onDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditShopMaintenance;



