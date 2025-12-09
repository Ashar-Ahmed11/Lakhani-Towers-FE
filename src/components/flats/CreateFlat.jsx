import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import VariantsManager from '../variantManager';

const CreateFlat = () => {
  const { createFlat, uploadImage, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [flatNumber, setFlatNumber] = useState('');
  const [rented, setRented] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Owner');

  // Owner/Tenant/Renter text inputs
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerCnic, setOwnerCnic] = useState('');
  const [ownerJoinDate, setOwnerJoinDate] = useState(new Date());
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantCnic, setTenantCnic] = useState('');
  const [tenantJoinDate, setTenantJoinDate] = useState(new Date());
  const [renterName, setRenterName] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [renterCnic, setRenterCnic] = useState('');
  const [renterJoinDate, setRenterJoinDate] = useState(new Date());

  // CNICs & Vehicles via VariantsManager
  const [cnics, setCnics] = useState([]);       // map -> {cnicName:variant, cnicNumber:price}
  const [vehicles, setVehicles] = useState([]); // map -> {vehicleName:variant, vehicleNumber:price}

  const [documentImages, setDocumentImages] = useState([]); // urls
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const [me, setMe] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      const m = await getAdminMe(); setMe(m || null);
      if (m && m.role === 'manager' && m.editRole === false) history.push('/dashboard');
      setLoadingData(false);
    })();
  }, [getAdminMe, history]);

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setLoading(true);
      const urls = [];
      for (const f of files) {
        const url = await uploadImage(f);
        urls.push(url);
      }
      setDocumentImages(prev => [...prev, ...urls]);
    } catch {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        flatNumber,
        rented,
        activeStatus,
        owner: ownerName || ownerPhone || ownerCnic ? { userName: ownerName, userMobile: Number(ownerPhone || 0), cnicNumber: ownerCnic || '', dateOfJoining: ownerJoinDate } : undefined,
        tenant: tenantName || tenantPhone || tenantCnic ? { userName: tenantName, userMobile: Number(tenantPhone || 0), cnicNumber: tenantCnic || '', dateOfJoining: tenantJoinDate } : undefined,
        renter: renterName || renterPhone || renterCnic ? { userName: renterName, userMobile: Number(renterPhone || 0), cnicNumber: renterCnic || '', dateOfJoining: renterJoinDate } : undefined,
        residentsCnics: cnics.map(x => ({ cnicName: x.variant, cnicNumber: x.price })),
        vehicleNo: vehicles.map(x => ({ vehicleName: x.variant, vehicleNumber: x.price })),
        documentImages: documentImages.map(url => ({ url })),
      };
      const created = await createFlat(payload);
      if (created?._id) {
        toast.success('Record created');
        // reset form
        setFlatNumber('');
        setRented(false);
        setActiveStatus('Owner');
        setOwnerName(''); setOwnerPhone(''); setOwnerCnic(''); setOwnerJoinDate(new Date());
        setTenantName(''); setTenantPhone(''); setTenantCnic(''); setTenantJoinDate(new Date());
        setRenterName(''); setRenterPhone(''); setRenterCnic(''); setRenterJoinDate(new Date());
        setCnics([]); setVehicles([]);
        setDocumentImages([]);
      } else throw new Error('Create failed');
    } catch (err) {
      toast.error(err?.message || 'Error creating flat');
    } finally {
      setLoading(false);
    }
  };

  // moved SearchBox to a stable component to avoid input remount/focus loss

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

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Flat</h1>
      <form onSubmit={onSubmit}>
        {loadingData && (
          <div className="alert alert-light d-flex align-items-center gap-2 py-2">
            <span className="spinner-border spinner-border-sm"></span>
            <span>Loading...</span>
          </div>
        )}
        <h5 className="mt-3">Flat Number</h5>
        <input value={flatNumber} onChange={(e)=>setFlatNumber(e.target.value)} className="form-control" placeholder="e.g., A-101" />

        <h5 className="mt-3">Rented</h5>
        <BadgeToggle active={rented} on="Rented" off="Owned" onClick={setRented} />

        <h5 className="mt-3">Active Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn btn-${activeStatus==='Tenant'?'primary':'outline-primary'}`} onClick={()=>setActiveStatus('Tenant')}>Tenant</button>
          <button type="button" className={`btn btn-${activeStatus==='Owner'?'primary':'outline-primary'} ms-2`} onClick={()=>setActiveStatus('Owner')}>Owner</button>
        </div>

        <h5 className="mt-4">Owner</h5>
        <input value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} className="form-control mb-2" placeholder="Owner name" />
        <input value={ownerPhone} onChange={(e)=>setOwnerPhone(e.target.value)} className="form-control mb-2" placeholder="Owner phone" />
        <input value={ownerCnic} onChange={(e)=>setOwnerCnic(e.target.value)} className="form-control mb-2" placeholder="Owner CNIC" />
        <input type="date" value={new Date(ownerJoinDate).toISOString().slice(0,10)} onChange={(e)=>setOwnerJoinDate(new Date(e.target.value))} className="form-control" placeholder="Date of Joining" />

        <h5 className="mt-4">Tenant</h5>
        <input value={tenantName} onChange={(e)=>setTenantName(e.target.value)} className="form-control mb-2" placeholder="Tenant name" />
        <input value={tenantPhone} onChange={(e)=>setTenantPhone(e.target.value)} className="form-control mb-2" placeholder="Tenant phone" />
        <input value={tenantCnic} onChange={(e)=>setTenantCnic(e.target.value)} className="form-control mb-2" placeholder="Tenant CNIC" />
        <input type="date" value={new Date(tenantJoinDate).toISOString().slice(0,10)} onChange={(e)=>setTenantJoinDate(new Date(e.target.value))} className="form-control" placeholder="Date of Joining" />

        <h5 className="mt-4">Renter</h5>
        <input value={renterName} onChange={(e)=>setRenterName(e.target.value)} className="form-control mb-2" placeholder="Renter name" />
        <input value={renterPhone} onChange={(e)=>setRenterPhone(e.target.value)} className="form-control mb-2" placeholder="Renter phone" />
        <input value={renterCnic} onChange={(e)=>setRenterCnic(e.target.value)} className="form-control mb-2" placeholder="Renter CNIC" />
        <input type="date" value={new Date(renterJoinDate).toISOString().slice(0,10)} onChange={(e)=>setRenterJoinDate(new Date(e.target.value))} className="form-control" placeholder="Date of Joining" />

        <h5 className="mt-4">Residents CNICs</h5>
        <VariantsManager variants={cnics} setVariants={setCnics} />

        <h5 className="mt-3">Vehicles</h5>
        <VariantsManager variants={vehicles} setVariants={setVehicles} />

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
          <button disabled={loading || loadingData || (me && (typeof me.editRole==='boolean') && me.editRole===false)} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Flat'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateFlat;


