import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateShopMaintenance = () => {
  const { getShops, getUsers, createShopMaintenance, uploadImage, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [shop, setShop] = useState(null);
  const [fromUser, setFromUser] = useState(null);
  const [maintenancePurpose, setMaintenancePurpose] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [month, setMonth] = useState([]);
  const [documentImages, setDocumentImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('shop'); // 'shop' | 'user'

  useEffect(() => { (async()=>{
    const m = await getAdminMe(); setMe(m || null); if (m && m.role === 'manager' && m.editRole === false) { history.push('/dashboard'); return; }
    setShops(await getShops() || []);
    setUsers(await getUsers() || []);
  })(); }, [getShops, getUsers, getAdminMe, history]);

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

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try{
      setLoading(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev=>[...prev, ...urls]);
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
        shop: shop?._id || null,
        from: fromUser?._id || null,
        documentImages: documentImages.map(url => ({ url })),
      };
      const created = await createShopMaintenance(payload);
      if (created?._id){
        toast.success('Record created');
        // reset form
        setMaintenancePurpose('');
        setMaintenanceAmount('');
        setMonth([]);
        setShop(null);
        setFromUser(null);
        setDocumentImages([]);
        setSearch(''); setResults([]);
        setSearchType('shop');
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
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Shop Maintenance</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Purpose</h5>
        <input value={maintenancePurpose} onChange={(e)=>setMaintenancePurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Amount</h5>
        <input value={maintenanceAmount} onChange={(e)=>setMaintenanceAmount(e.target.value)} className="form-control" placeholder="Amount" type="number" />

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
              <span>
                Shop {shop.shopNumber}
                {(() => {
                  const active = shop.activeStatus || 'Owner';
                  let person = null;
                  if (active === 'Owner') {
                    const o = (shop.owners || []).find(x => x.owned) || (shop.owners||[])[0];
                    const id = o?.user?._id || o?.user;
                    person = (users || []).find(u => u._id === id);
                  } else if (active === 'Tenant') {
                    const t = (shop.tenant || []).find(x => x.active) || (shop.tenant||[])[0];
                    const id = t?.user?._id || t?.user;
                    person = (users || []).find(u => u._id === id);
                  }
                  return person ? <span className="ms-2 small">({active}: {person.userName} - {person.userMobile})</span> : <span className="ms-2 small">({active})</span>;
                })()}
              </span>
              <button type="button" className="btn-close" onClick={()=>setShop(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">From User</h5>
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
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Maintenance'}
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateShopMaintenance;



