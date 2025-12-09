import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditShop = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getShopById, updateShop, deleteShop, uploadImage, getAdminMe } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async()=>{
      setLoading(true);
      const [data, meRes] = await Promise.all([getShopById(id), getAdminMe()]);
      setMe(meRes || null);
      setShopNumber(data.shopNumber || '');
      setRented(!!data.rented);
      setActiveStatus(data.activeStatus || 'Owner');
      setOwnerName(data?.owner?.userName || '');
      setOwnerPhone(String(data?.owner?.userMobile || ''));
      setTenantName(data?.tenant?.userName || '');
      setTenantPhone(String(data?.tenant?.userMobile || ''));
      setRenterName(data?.renter?.userName || '');
      setRenterPhone(String(data?.renter?.userMobile || ''));
      setDocumentImages((data.documentImages || []).map(x => x.url));
      setLoading(false);
    })();
  }, [id, getShopById, getAdminMe]);

  const [me, setMe] = useState(null);
  const isAdmin = !!me && me.email === 'admin@lakhanitowers.com';
  const isManager = !!me && (((me.role || '').toLowerCase() === 'manager') || typeof me.editRole === 'boolean');
  const canEditGeneral = isAdmin || (isManager && me.editRole);
  const canSave = isAdmin || (isManager && me.editRole);
  const canDelete = isAdmin;

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try{
      setSaving(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev=>[...prev, ...urls]);
    }finally{
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      const payload = {
        shopNumber,
        rented,
        activeStatus,
        owner: ownerName || ownerPhone ? { userName: ownerName, userMobile: Number(ownerPhone || 0) } : undefined,
        tenant: tenantName || tenantPhone ? { userName: tenantName, userMobile: Number(tenantPhone || 0) } : undefined,
        renter: renterName || renterPhone ? { userName: renterName, userMobile: Number(renterPhone || 0) } : undefined,
        documentImages: documentImages.map(url => ({ url })),
      };
      await updateShop(id, payload);
      toast.success('Shop updated');
    }catch(err){
      toast.error(err?.message || 'Update failed');
    }finally{
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;
    try{
      setDeleting(true);
      await deleteShop(id);
      toast.success('Shop deleted');
      history.push('/dashboard/shops');
    }finally{
      setDeleting(false);
    }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const BadgeToggle = ({ active, on, off, onClick, disabled }) => (
    <div className="btn-group">
      <button type="button" className={`btn btn-${active ? 'primary':'outline-primary'}`} onClick={()=>{ if(disabled) return; onClick(true)}} disabled={!!disabled}>{on}</button>
      <button type="button" className={`btn btn-${!active ? 'primary':'outline-primary'} ms-2`} onClick={()=>{ if(disabled) return; onClick(false)}} disabled={!!disabled}>{off}</button>
    </div>
  );

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit Shop</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Shop Number</h5>
        <input disabled={!canEditGeneral} value={shopNumber} onChange={(e)=>setShopNumber(e.target.value)} className="form-control" placeholder="e.g., S-01" />

        <h5 className="mt-3">Rented</h5>
        <BadgeToggle active={rented} on="Rented" off="Owned" onClick={setRented} disabled={!canEditGeneral} />

        <h5 className="mt-3">Active Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn btn-${activeStatus==='Tenant'?'primary':'outline-primary'}`} onClick={()=>{ if(!canEditGeneral) return; setActiveStatus('Tenant')}} disabled={!canEditGeneral}>Tenant</button>
          <button type="button" className={`btn btn-${activeStatus==='Owner'?'primary':'outline-primary'} ms-2`} onClick={()=>{ if(!canEditGeneral) return; setActiveStatus('Owner')}} disabled={!canEditGeneral}>Owner</button>
        </div>

        <h5 className="mt-4">Owner</h5>
        <input disabled={!canEditGeneral} value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} className="form-control mb-2" placeholder="Owner name" />
        <input disabled={!canEditGeneral} value={ownerPhone} onChange={(e)=>setOwnerPhone(e.target.value)} className="form-control" placeholder="Owner phone" />

        <h5 className="mt-4">Tenant</h5>
        <input disabled={!canEditGeneral} value={tenantName} onChange={(e)=>setTenantName(e.target.value)} className="form-control mb-2" placeholder="Tenant name" />
        <input disabled={!canEditGeneral} value={tenantPhone} onChange={(e)=>setTenantPhone(e.target.value)} className="form-control" placeholder="Tenant phone" />

        <h5 className="mt-4">Renter</h5>
        <input disabled={!canEditGeneral} value={renterName} onChange={(e)=>setRenterName(e.target.value)} className="form-control mb-2" placeholder="Renter name" />
        <input disabled={!canEditGeneral} value={renterPhone} onChange={(e)=>setRenterPhone(e.target.value)} className="form-control" placeholder="Renter phone" />

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
              <span onClick={()=>{ if(!canEditGeneral) return; setDocumentImages(documentImages.filter((_,i)=>i!==idx))}} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor: canEditGeneral ? 'pointer' : 'not-allowed', opacity: canEditGeneral ? 1 : .5 }} className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button onClick={onDelete} type="button" disabled={deleting || !canDelete} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving || !canSave} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditShop;





