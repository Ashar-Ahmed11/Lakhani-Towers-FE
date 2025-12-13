import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditShop = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getShopById, updateShop, deleteShop, uploadImage, getAdminMe } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [shopNumber, setShopNumber] = useState('');
  const [activeStatus, setActiveStatus] = useState('Owner');

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerCnic, setOwnerCnic] = useState('');
  const [ownerJoinDate, setOwnerJoinDate] = useState(new Date());
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantCnic, setTenantCnic] = useState('');
  const [tenantJoinDate, setTenantJoinDate] = useState(new Date());

  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const didInitRef = useRef(false);
  const [shopDetails, setShopDetails] = useState(null);
  // Maintenance
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
    (async()=>{
      setLoading(true);
      const [data, meRes] = await Promise.all([getShopById(id), getAdminMe()]);
      setMe(meRes || null);
      setShopDetails(data || null);
      setShopNumber(data.shopNumber || '');
      setActiveStatus(data.activeStatus || 'Owner');
      setOwnerName(data?.owner?.userName || '');
      setOwnerPhone(String(data?.owner?.userMobile || ''));
      setOwnerCnic(String(data?.owner?.cnicNumber || ''));
      setOwnerJoinDate(data?.owner?.dateOfJoining ? new Date(data.owner.dateOfJoining) : new Date());
      setTenantName(data?.tenant?.userName || '');
      setTenantPhone(String(data?.tenant?.userMobile || ''));
      setTenantCnic(String(data?.tenant?.cnicNumber || ''));
      setTenantJoinDate(data?.tenant?.dateOfJoining ? new Date(data.tenant.dateOfJoining) : new Date());
      setDocumentImages((data.documentImages || []).map(x => x.url));
      // maintenance
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
        activeStatus,
        owner: ownerName || ownerPhone || ownerCnic ? { userName: ownerName, userMobile: Number(ownerPhone || 0), cnicNumber: ownerCnic || '', dateOfJoining: ownerJoinDate } : undefined,
        tenant: tenantName || tenantPhone || tenantCnic ? { userName: tenantName, userMobile: Number(tenantPhone || 0), cnicNumber: tenantCnic || '', dateOfJoining: tenantJoinDate } : undefined,
        documentImages: documentImages.map(url => ({ url })),
        maintenanceRecord: {
          MonthlyMaintenance: Number(mmMonthly || 0),
          Outstandings: { amount: Number(mmOutAmt || 0), fromDate: mmOutFrom, toDate: mmOutTo },
          OtherOutstandings: { remarks: mmOtherRemarks || '', amount: Number(mmOtherAmt || 0) },
          monthlyOutstandings: { amount: Number(mmMonthlyOutAmt || 0) },
          AdvanceMaintenance: { amount: Number(mmAdvAmt || 0), fromDate: mmAdvFrom, toDate: mmAdvTo },
        },
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
      <h1 className="display-4" style={{ fontWeight: 900 }}>Shop Record</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Shop Number</h5>
        <input disabled={!canEditGeneral} value={shopNumber} onChange={(e)=>setShopNumber(e.target.value)} className="form-control" placeholder="e.g., S-01" />

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

        <h5 className="mt-4">Tenant</h5>
        <input disabled={!canEditGeneral} value={tenantName} onChange={(e)=>setTenantName(e.target.value)} className="form-control mb-2" placeholder="Tenant name" />
        <input disabled={!canEditGeneral} value={tenantPhone} onChange={(e)=>setTenantPhone(e.target.value)} className="form-control mb-2" placeholder="Tenant phone" />
        <input disabled={!canEditGeneral} value={tenantCnic} onChange={(e)=>setTenantCnic(e.target.value)} className="form-control mb-2" placeholder="Tenant CNIC" />
        <DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yy" className='form-control' selected={tenantJoinDate} onChange={(date)=>setTenantJoinDate(date)} />

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

export default EditShop;





