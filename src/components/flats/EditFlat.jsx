import React, { useContext, useEffect, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import VariantsManager from '../variantManager';

const EditFlat = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getFlatById, updateFlat, deleteFlat, uploadImage, getAdminMe } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [flatNumber, setFlatNumber] = useState('');
  const [activeStatus, setActiveStatus] = useState('Owner');

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerCnic, setOwnerCnic] = useState('');
  const [ownerJoinDate, setOwnerJoinDate] = useState(new Date());
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantCnic, setTenantCnic] = useState('');
  const [tenantJoinDate, setTenantJoinDate] = useState(new Date());
  

  const [cnics, setCnics] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const didInitRef = useRef(false);
  const [flatDetails, setFlatDetails] = useState(null);
  // Maintenance Record
  const [mmMonthly, setMmMonthly] = useState(0);
  const [mmOutAmt, setMmOutAmt] = useState(0);
  const [mmOutFrom, setMmOutFrom] = useState(new Date());
  const [mmOutTo, setMmOutTo] = useState(new Date());
  const [mmOtherRemarks, setMmOtherRemarks] = useState('');
  const [mmOtherAmt, setMmOtherAmt] = useState(0);
  const [mmAdvAmt, setMmAdvAmt] = useState(0);
  const [mmAdvFrom, setMmAdvFrom] = useState(new Date());
  const [mmAdvTo, setMmAdvTo] = useState(new Date());
  const [mmMonthlyOutAmt, setMmMonthlyOutAmt] = useState(0);

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
      setActiveStatus(data.activeStatus || 'Owner');
      setOwnerName(data?.owner?.userName || '');
      setOwnerPhone(String(data?.owner?.userMobile || ''));
      setOwnerCnic(String(data?.owner?.cnicNumber || ''));
      setOwnerJoinDate(data?.owner?.dateOfJoining ? new Date(data.owner.dateOfJoining) : new Date());
      setTenantName(data?.tenant?.userName || '');
      setTenantPhone(String(data?.tenant?.userMobile || ''));
      setTenantCnic(String(data?.tenant?.cnicNumber || ''));
      setTenantJoinDate(data?.tenant?.dateOfJoining ? new Date(data.tenant.dateOfJoining) : new Date());
      
      setCnics((data.residentsCnics || []).map(x => ({ variant: x.cnicName, price: x.cnicNumber })));
      setVehicles((data.vehicleNo || []).map(x => ({ variant: x.vehicleName, price: x.vehicleNumber })));
      setDocumentImages((data.documentImages || []).map(x => x.url));
      // Maintenance record
      const mm = data?.maintenanceRecord || {};
      setMmMonthly(Number(mm?.MonthlyMaintenance || 0));
      setMmOutAmt(Number(mm?.Outstandings?.amount || 0));
      setMmOutFrom(mm?.Outstandings?.fromDate ? new Date(mm.Outstandings.fromDate) : new Date());
      setMmOutTo(mm?.Outstandings?.toDate ? new Date(mm.Outstandings.toDate) : new Date());
      setMmOtherRemarks(mm?.OtherOutstandings?.remarks || '');
      setMmOtherAmt(Number(mm?.OtherOutstandings?.amount || 0));
      setMmAdvAmt(Number(mm?.AdvanceMaintenance?.amount || 0));
      setMmAdvFrom(mm?.AdvanceMaintenance?.fromDate ? new Date(mm.AdvanceMaintenance.fromDate) : new Date());
      setMmAdvTo(mm?.AdvanceMaintenance?.toDate ? new Date(mm.AdvanceMaintenance.toDate) : new Date());
      setMmMonthlyOutAmt(Number(mm?.monthlyOutstandings?.amount || 0));
      setLoading(false);
    })();
  }, [id, getFlatById, getAdminMe]);

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
        activeStatus,
        owner: ownerName || ownerPhone || ownerCnic ? { userName: ownerName, userMobile: Number(ownerPhone || 0), cnicNumber: ownerCnic || '', dateOfJoining: ownerJoinDate } : undefined,
        tenant: tenantName || tenantPhone || tenantCnic ? { userName: tenantName, userMobile: Number(tenantPhone || 0), cnicNumber: tenantCnic || '', dateOfJoining: tenantJoinDate } : undefined,
        
        residentsCnics: cnics.map(x => ({ cnicName: x.variant, cnicNumber: x.price })),
        vehicleNo: vehicles.map(x => ({ vehicleName: x.variant, vehicleNumber: x.price })),
        documentImages: documentImages.map(url => ({ url })),
        maintenanceRecord: {
          MonthlyMaintenance: Number(mmMonthly || 0),
          Outstandings: { amount: Number(mmOutAmt || 0), fromDate: mmOutFrom, toDate: mmOutTo },
          OtherOutstandings: { remarks: mmOtherRemarks || '', amount: Number(mmOtherAmt || 0) },
          monthlyOutstandings: { amount: Number(mmMonthlyOutAmt || 0) },
          AdvanceMaintenance: { amount: Number(mmAdvAmt || 0), fromDate: mmAdvFrom, toDate: mmAdvTo },
        },
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

  

  // moved SearchBox to a stable component to avoid input remount/focus loss

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Flat Record</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Flat Number</h5>
        <input disabled={!canEditGeneral} value={flatNumber} onChange={(e)=>setFlatNumber(e.target.value)} className="form-control" placeholder="e.g., A-101" />

        <h5 className="mt-3">Active Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn btn-${activeStatus==='Tenant'?'primary':'outline-primary'}`} onClick={()=>{ if(!canEditGeneral) return; setActiveStatus('Tenant')}} disabled={!canEditGeneral}>Tenant</button>
          <button type="button" className={`btn btn-${activeStatus==='Owner'?'primary':'outline-primary'} ms-2`} onClick={()=>{ if(!canEditGeneral) return; setActiveStatus('Owner')}} disabled={!canEditGeneral}>Owner</button>
        </div>

        <h5 className="mt-4">Owner</h5>
        <input disabled={!canEditGeneral} value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} className="form-control mb-2" placeholder="Owner name" />
        <input disabled={!canEditGeneral} value={ownerPhone} onChange={(e)=>setOwnerPhone(e.target.value)} className="form-control mb-2" placeholder="Owner phone" />
        <input disabled={!canEditGeneral} value={ownerCnic} onChange={(e)=>setOwnerCnic(e.target.value)} className="form-control mb-2" placeholder="Owner CNIC" />
        <DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yy" className='form-control' selected={ownerJoinDate} onChange={(date)=>setOwnerJoinDate(date)} />
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
        <DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yy" className='form-control' selected={tenantJoinDate} onChange={(date)=>setTenantJoinDate(date)} />
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

        

        <h5 className="mt-4">Residents CNICs</h5>
        <VariantsManager variants={cnics} setVariants={setCnics} />

        <h5 className="mt-3">Vehicles</h5>
        <VariantsManager variants={vehicles} setVariants={setVehicles} />

        <h5 className="mt-4">Maintenance Record</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">Monthly Maintenance</label>
            <input disabled={!canEditGeneral} type="number" className="form-control" value={mmMonthly} onChange={(e)=>setMmMonthly(Number(e.target.value||0))} />
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Outstandings</div>
          <div className="row g-2">
            <div className="col-md-3"><input disabled={!canEditGeneral} type="number" className="form-control" placeholder="Amount" value={mmOutAmt} onChange={(e)=>setMmOutAmt(Number(e.target.value||0))} /></div>
            <div className="col-md-3"><DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yy" className='form-control' selected={mmOutFrom} onChange={(date)=>setMmOutFrom(date)} /></div>
            <div className="col-md-3"><DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yy" className='form-control' selected={mmOutTo} onChange={(date)=>setMmOutTo(date)} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Other Outstandings</div>
          <div className="row g-2">
            <div className="col-md-6"><input disabled={!canEditGeneral} className="form-control" placeholder="Remarks" value={mmOtherRemarks} onChange={(e)=>setMmOtherRemarks(e.target.value)} /></div>
            <div className="col-md-3"><input disabled={!canEditGeneral} type="number" className="form-control" placeholder="Amount" value={mmOtherAmt} onChange={(e)=>setMmOtherAmt(Number(e.target.value||0))} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Monthly Outstandings</div>
          <div className="row g-2">
            <div className="col-md-3"><input disabled={!canEditGeneral} type="number" className="form-control" placeholder="Amount" value={mmMonthlyOutAmt} onChange={(e)=>setMmMonthlyOutAmt(Number(e.target.value||0))} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Advance Maintenance</div>
          <div className="row g-2">
            <div className="col-md-3"><input disabled={!canEditGeneral} type="number" className="form-control" placeholder="Amount" value={mmAdvAmt} onChange={(e)=>setMmAdvAmt(Number(e.target.value||0))} /></div>
            <div className="col-md-3"><DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yy" className='form-control' selected={mmAdvFrom} onChange={(date)=>setMmAdvFrom(date)} /></div>
            <div className="col-md-3"><DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yy" className='form-control' selected={mmAdvTo} onChange={(date)=>setMmAdvTo(date)} /></div>
          </div>
        </div>

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

export default EditFlat;


