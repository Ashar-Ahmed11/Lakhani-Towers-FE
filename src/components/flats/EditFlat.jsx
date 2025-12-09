import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import VariantsManager from '../variantManager';

const EditFlat = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getFlatById, updateFlat, deleteFlat, uploadImage, getAdminMe, getCustomHeaderRecords, getMaintenance } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [flatNumber, setFlatNumber] = useState('');
  const [rented, setRented] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Owner');

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

  const [cnics, setCnics] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const didInitRef = useRef(false);
  const [flatDetails, setFlatDetails] = useState(null);
  const [incomingRecords, setIncomingRecords] = useState([]);
  const [expenseRecords, setExpenseRecords] = useState([]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      setLoading(true);
      const [data, meRes] = await Promise.all([getFlatById(id), getAdminMe()]);
      const me = meRes || null;
      setMe(me);
      setFlatDetails(data);
      setFlatNumber(data.flatNumber || '');
      setRented(!!data.rented);
      setActiveStatus(data.activeStatus || 'Owner');
      setOwnerName(data?.owner?.userName || '');
      setOwnerPhone(String(data?.owner?.userMobile || ''));
      setOwnerCnic(String(data?.owner?.cnicNumber || ''));
      setOwnerJoinDate(data?.owner?.dateOfJoining ? new Date(data.owner.dateOfJoining) : new Date());
      setTenantName(data?.tenant?.userName || '');
      setTenantPhone(String(data?.tenant?.userMobile || ''));
      setTenantCnic(String(data?.tenant?.cnicNumber || ''));
      setTenantJoinDate(data?.tenant?.dateOfJoining ? new Date(data.tenant.dateOfJoining) : new Date());
      setRenterName(data?.renter?.userName || '');
      setRenterPhone(String(data?.renter?.userMobile || ''));
      setRenterCnic(String(data?.renter?.cnicNumber || ''));
      setRenterJoinDate(data?.renter?.dateOfJoining ? new Date(data.renter.dateOfJoining) : new Date());
      setCnics((data.residentsCnics || []).map(x => ({ variant: x.cnicName, price: x.cnicNumber })));
      setVehicles((data.vehicleNo || []).map(x => ({ variant: x.vehicleName, price: x.vehicleNumber })));
      setDocumentImages((data.documentImages || []).map(x => x.url));
      // Load linked Custom Header Records for this flat
      try{
        const [inList, exList, maintList] = await Promise.all([
          getCustomHeaderRecords ? getCustomHeaderRecords({ headerType: 'Incoming' }) : Promise.resolve([]),
          getCustomHeaderRecords ? getCustomHeaderRecords({ headerType: 'Expense' }) : Promise.resolve([]),
          getMaintenance ? getMaintenance({}) : Promise.resolve([]),
        ]);
        const flatId = data?._id || id;
        const filterByFlat = (arr, byKey) => (arr || []).filter(r => {
          const ref = r?.[byKey];
          const val = (ref && (ref._id || ref)) || null;
          return val === flatId;
        });
        const chrIncoming = filterByFlat(inList, 'fromUser');
        const maintIncoming = (maintList || []).filter(m => ((m.flat?._id || m.flat) === flatId));
        // Merge CHR incoming and Maintenance into one list (like user page)
        const mergedIncoming = [
          ...chrIncoming.map(r => ({ _type: 'chr', _id: r._id, title: r.header?.headerName || 'Incoming', amount: Number(r.amount||0), months: Array.isArray(r.month)? r.month.length : 0, link: `/dashboard/custom-headers/${r.header?._id || r.header}/record/${r._id}` })),
          ...maintIncoming.map(m => ({ _type: 'maintenance', _id: m._id, title: 'Maintenance', amount: Number(m.maintenanceAmount||0), months: Array.isArray(m.month)? m.month.length : 0, link: `/dashboard/edit-maintenance/${m._id}` })),
        ];
        setIncomingRecords(mergedIncoming);
        setExpenseRecords(filterByFlat(exList, 'toUser'));
      }catch{/* ignore */}
      setLoading(false);
    })();
  }, [id, getFlatById, getAdminMe, getCustomHeaderRecords, getMaintenance]);

  const [me, setMe] = useState(null);
  const isAdmin = !!me && me.email === 'admin@lakhanitowers.com';
  const isManager = !!me && (((me.role || '').toLowerCase() === 'manager') || typeof me.editRole === 'boolean');
  const canEditGeneral = isAdmin || (isManager && me.editRole);
  const canSave = isAdmin || (isManager && me.editRole);
  const canDelete = isAdmin;

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setSaving(true);
      const urls = [];
      for (const f of files) {
        const url = await uploadImage(f);
        urls.push(url);
      }
      setDocumentImages(prev => [...prev, ...urls]);
    } catch {
      toast.error('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
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
      const updated = await updateFlat(id, payload);
      toast.success('Flat updated');
    } catch (err) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this flat?')) return;
    try {
      setDeleting(true);
      await deleteFlat(id);
      toast.success('Flat deleted');
      history.push('/dashboard/flats');
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
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

  // moved SearchBox to a stable component to avoid input remount/focus loss

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit Flat</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Flat Number</h5>
        <input disabled={!canEditGeneral} value={flatNumber} onChange={(e)=>setFlatNumber(e.target.value)} className="form-control" placeholder="e.g., A-101" />

        <h5 className="mt-3">Rented</h5>
        <BadgeToggle active={rented} on="Rented" off="Owned" onClick={setRented} disabled={!canEditGeneral} />

        <h5 className="mt-3">Active Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn btn-${activeStatus==='Tenant'?'primary':'outline-primary'}`} onClick={()=>{ if(!canEditGeneral) return; setActiveStatus('Tenant')}} disabled={!canEditGeneral}>Tenant</button>
          <button type="button" className={`btn btn-${activeStatus==='Owner'?'primary':'outline-primary'} ms-2`} onClick={()=>{ if(!canEditGeneral) return; setActiveStatus('Owner')}} disabled={!canEditGeneral}>Owner</button>
        </div>

        <h5 className="mt-4">Owner</h5>
        <input disabled={!canEditGeneral} value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} className="form-control mb-2" placeholder="Owner name" />
        <input disabled={!canEditGeneral} value={ownerPhone} onChange={(e)=>setOwnerPhone(e.target.value)} className="form-control mb-2" placeholder="Owner phone" />
        <input disabled={!canEditGeneral} value={ownerCnic} onChange={(e)=>setOwnerCnic(e.target.value)} className="form-control mb-2" placeholder="Owner CNIC" />
        <input disabled={!canEditGeneral} type="date" value={new Date(ownerJoinDate).toISOString().slice(0,10)} onChange={(e)=>setOwnerJoinDate(new Date(e.target.value))} className="form-control" placeholder="Date of Joining" />
        {(Array.isArray(flatDetails?.previousOwners) && flatDetails.previousOwners.length>0) && (
          <div className="mt-2">
            <h6 className="fw-bold">Previous Owners</h6>
            <div className="list-group">
              {flatDetails.previousOwners.map((p,i)=>(
                <div key={i} className="list-group-item">
                  <div className="row g-2">
                    <div className="col-md-3"><input disabled className="form-control" value={p.userName||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.userMobile||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.cnicNumber||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.dateOfJoining ? new Date(p.dateOfJoining).toISOString().slice(0,10) : ''} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h5 className="mt-4">Tenant</h5>
        <input disabled={!canEditGeneral} value={tenantName} onChange={(e)=>setTenantName(e.target.value)} className="form-control mb-2" placeholder="Tenant name" />
        <input disabled={!canEditGeneral} value={tenantPhone} onChange={(e)=>setTenantPhone(e.target.value)} className="form-control mb-2" placeholder="Tenant phone" />
        <input disabled={!canEditGeneral} value={tenantCnic} onChange={(e)=>setTenantCnic(e.target.value)} className="form-control mb-2" placeholder="Tenant CNIC" />
        <input disabled={!canEditGeneral} type="date" value={new Date(tenantJoinDate).toISOString().slice(0,10)} onChange={(e)=>setTenantJoinDate(new Date(e.target.value))} className="form-control" placeholder="Date of Joining" />
        {(Array.isArray(flatDetails?.previousTenants) && flatDetails.previousTenants.length>0) && (
          <div className="mt-2">
            <h6 className="fw-bold">Previous Tenants</h6>
            <div className="list-group">
              {flatDetails.previousTenants.map((p,i)=>(
                <div key={i} className="list-group-item">
                  <div className="row g-2">
                    <div className="col-md-3"><input disabled className="form-control" value={p.userName||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.userMobile||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.cnicNumber||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.dateOfJoining ? new Date(p.dateOfJoining).toISOString().slice(0,10) : ''} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h5 className="mt-4">Renter</h5>
        <input disabled={!canEditGeneral} value={renterName} onChange={(e)=>setRenterName(e.target.value)} className="form-control mb-2" placeholder="Renter name" />
        <input disabled={!canEditGeneral} value={renterPhone} onChange={(e)=>setRenterPhone(e.target.value)} className="form-control mb-2" placeholder="Renter phone" />
        <input disabled={!canEditGeneral} value={renterCnic} onChange={(e)=>setRenterCnic(e.target.value)} className="form-control mb-2" placeholder="Renter CNIC" />
        <input disabled={!canEditGeneral} type="date" value={new Date(renterJoinDate).toISOString().slice(0,10)} onChange={(e)=>setRenterJoinDate(new Date(e.target.value))} className="form-control" placeholder="Date of Joining" />
        {(Array.isArray(flatDetails?.previousRenters) && flatDetails.previousRenters.length>0) && (
          <div className="mt-2">
            <h6 className="fw-bold">Previous Renters</h6>
            <div className="list-group">
              {flatDetails.previousRenters.map((p,i)=>(
                <div key={i} className="list-group-item">
                  <div className="row g-2">
                    <div className="col-md-3"><input disabled className="form-control" value={p.userName||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.userMobile||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.cnicNumber||''} /></div>
                    <div className="col-md-3"><input disabled className="form-control" value={p.dateOfJoining ? new Date(p.dateOfJoining).toISOString().slice(0,10) : ''} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h5 className="mt-4">Residents CNICs</h5>
        <VariantsManager variants={cnics} setVariants={setCnics} />

        <h5 className="mt-3">Vehicles</h5>
        <VariantsManager variants={vehicles} setVariants={setVehicles} />

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
      {/* Linked Records */}
      <div className="mt-4">
        <h4 className="fw-bold">Incoming Records</h4>
        {(incomingRecords || []).length === 0 ? (
          <div className="text-muted">No incoming records.</div>
        ) : (
          <div className="list-group">
            {incomingRecords.map(r => (
              <div key={r._id} className="list-group-item d-flex justify-content-between align-items-center" style={{ cursor:'pointer' }} onClick={()=>window.open(r.link,'_blank')}>
                <div>
                  <div className="fw-semibold">{r.title}</div>
                  <div className="small text-muted">
                    Amount: {Number(r.amount || 0).toLocaleString('en-PK')} PKR
                    {r.months > 0 ? ` | Months: ${r.months}` : ''}
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-dark" onClick={(e)=>{ e.stopPropagation(); window.open(r.link,'_blank')}}>Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h4 className="fw-bold">Expense Records</h4>
        {(expenseRecords || []).length === 0 ? (
          <div className="text-muted">No expense records.</div>
        ) : (
          <div className="list-group">
            {expenseRecords.map(r => (
              <div key={r._id} className="list-group-item d-flex justify-content-between align-items-center" style={{ cursor:'pointer' }} onClick={()=>window.open(`/dashboard/custom-headers/${r.header?._id || r.header}/record/${r._id}`,'_blank')}>
                <div>
                  <div className="fw-semibold">{r.header?.headerName || 'Expense'}</div>
                  <div className="small text-muted">
                    Amount: {Number(r.amount || 0).toLocaleString('en-PK')} PKR
                    {Array.isArray(r.month) && r.month.length>0 ? ` | Months: ${r.month.length}` : ''}
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-dark" onClick={(e)=>{ e.stopPropagation(); window.open(`/dashboard/custom-headers/${r.header?._id || r.header}/record/${r._id}`,'_blank')}}>Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default EditFlat;


