import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateShop = () => {
  const { createShop, uploadImage, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [shopNumber, setShopNumber] = useState('');
  const [rented, setRented] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Owner');

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [renterName, setRenterName] = useState('');
  const [renterPhone, setRenterPhone] = useState('');

  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => { (async()=>{
    const m = await getAdminMe(); setMe(m || null);
    if (m && m.role === 'manager' && m.editRole === false) history.push('/dashboard');
  })(); }, [getAdminMe, history]);

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

  const BadgeToggle = ({ active, on, off, onClick }) => (
    <div className="btn-group">
      <button type="button" className={`btn btn-${active ? 'primary':'outline-primary'}`} onClick={()=>onClick(true)}>{on}</button>
      <button type="button" className={`btn btn-${!active ? 'primary':'outline-primary'} ms-2`} onClick={()=>onClick(false)}>{off}</button>
    </div>
  );

  const UserCard = ({ row, right }) => (
    <div className="card border-0 shadow-sm p-2 my-2">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h6 className="mb-1">{row.user.userName}</h6>
          <div className="text-muted small">Mobile: {row.user.userMobile}</div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {right}
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={()=>right.props.onRemove(row.user._id)}>Remove</button>
        </div>
      </div>
    </div>
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const payload = {
        shopNumber,
        rented,
        activeStatus,
        owner: ownerName || ownerPhone ? { userName: ownerName, userMobile: Number(ownerPhone || 0) } : undefined,
        tenant: tenantName || tenantPhone ? { userName: tenantName, userMobile: Number(tenantPhone || 0) } : undefined,
        renter: renterName || renterPhone ? { userName: renterName, userMobile: Number(renterPhone || 0) } : undefined,
        documentImages: documentImages.map(url => ({ url })),
      };
      const created = await createShop(payload);
      toast.success('Record created');
      // reset form
      setShopNumber('');
      setRented(false);
      setActiveStatus('Owner');
      setOwnerName(''); setOwnerPhone('');
      setTenantName(''); setTenantPhone('');
      setRenterName(''); setRenterPhone('');
      setDocumentImages([]);
    }catch(err){
      toast.error(err?.message || 'Create failed');
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Shop</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Shop Number</h5>
        <input value={shopNumber} onChange={(e)=>setShopNumber(e.target.value)} className="form-control" placeholder="e.g., S-01" />

        <h5 className="mt-3">Rented</h5>
        <BadgeToggle active={rented} on="Rented" off="Owned" onClick={setRented} />

        <h5 className="mt-3">Active Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn btn-${activeStatus==='Tenant'?'primary':'outline-primary'}`} onClick={()=>setActiveStatus('Tenant')}>Tenant</button>
          <button type="button" className={`btn btn-${activeStatus==='Owner'?'primary':'outline-primary'} ms-2`} onClick={()=>setActiveStatus('Owner')}>Owner</button>
        </div>

        <h5 className="mt-4">Owner</h5>
        <input value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} className="form-control mb-2" placeholder="Owner name" />
        <input value={ownerPhone} onChange={(e)=>setOwnerPhone(e.target.value)} className="form-control" placeholder="Owner phone" />

        <h5 className="mt-4">Tenant</h5>
        <input value={tenantName} onChange={(e)=>setTenantName(e.target.value)} className="form-control mb-2" placeholder="Tenant name" />
        <input value={tenantPhone} onChange={(e)=>setTenantPhone(e.target.value)} className="form-control" placeholder="Tenant phone" />

        <h5 className="mt-4">Renter</h5>
        <input value={renterName} onChange={(e)=>setRenterName(e.target.value)} className="form-control mb-2" placeholder="Renter name" />
        <input value={renterPhone} onChange={(e)=>setRenterPhone(e.target.value)} className="form-control" placeholder="Renter phone" />

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

        <div className="d-flex justify-content-end mt-4">
          <button disabled={loading || (me && (typeof me.editRole==='boolean') && me.editRole===false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Shop'}
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateShop;





