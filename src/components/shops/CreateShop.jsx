import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateShop = () => {
  const { createShop, uploadImage, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

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
  const [me, setMe] = useState(null);
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
      const created = await createShop(payload);
      toast.success('Record created');
      // reset form
      setShopNumber('');
      setActiveStatus('Owner');
      setOwnerName(''); setOwnerPhone(''); setOwnerCnic(''); setOwnerJoinDate(new Date());
      setTenantName(''); setTenantPhone(''); setTenantCnic(''); setTenantJoinDate(new Date());
      setDocumentImages([]);
      setMmMonthly(0);
      setMmOutAmt(0); setMmOutFrom(new Date()); setMmOutTo(new Date());
      setMmOtherRemarks(''); setMmOtherAmt(0);
      setMmAdvAmt(0); setMmAdvFrom(new Date()); setMmAdvTo(new Date());
      setMmMonthlyOutAmt(0);
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

        <h5 className="mt-3">Active Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn btn-${activeStatus==='Tenant'?'primary':'outline-primary'}`} onClick={()=>setActiveStatus('Tenant')}>Tenant</button>
          <button type="button" className={`btn btn-${activeStatus==='Owner'?'primary':'outline-primary'} ms-2`} onClick={()=>setActiveStatus('Owner')}>Owner</button>
        </div>

        <h5 className="mt-4">Owner</h5>
        <input value={ownerName} onChange={(e)=>setOwnerName(e.target.value)} className="form-control mb-2" placeholder="Owner name" />
        <input value={ownerPhone} onChange={(e)=>setOwnerPhone(e.target.value)} className="form-control mb-2" placeholder="Owner phone" />
        <input value={ownerCnic} onChange={(e)=>setOwnerCnic(e.target.value)} className="form-control mb-2" placeholder="Owner CNIC" />
        <DatePicker dateFormat="dd/MM/yy" className='form-control' selected={ownerJoinDate} onChange={(date)=>setOwnerJoinDate(date)} />

        <h5 className="mt-4">Tenant</h5>
        <input value={tenantName} onChange={(e)=>setTenantName(e.target.value)} className="form-control mb-2" placeholder="Tenant name" />
        <input value={tenantPhone} onChange={(e)=>setTenantPhone(e.target.value)} className="form-control mb-2" placeholder="Tenant phone" />
        <input value={tenantCnic} onChange={(e)=>setTenantCnic(e.target.value)} className="form-control mb-2" placeholder="Tenant CNIC" />
        <DatePicker dateFormat="dd/MM/yy" className='form-control' selected={tenantJoinDate} onChange={(date)=>setTenantJoinDate(date)} />

        <h5 className="mt-3">Document Images</h5>
        <div className="input-group mb-3">
          <input onChange={uploadDocs} type="file" className="form-control" multiple />
          <label className="input-group-text">Upload</label>
          {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        <h5 className="mt-4">Maintenance Record</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">Monthly Maintenance</label>
            <input type="number" className="form-control" value={mmMonthly} onChange={(e)=>setMmMonthly(Number(e.target.value||0))} />
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Outstandings</div>
          <div className="row g-2">
            <div className="col-md-3"><input type="number" className="form-control" placeholder="Amount" value={mmOutAmt} onChange={(e)=>setMmOutAmt(Number(e.target.value||0))} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={mmOutFrom} onChange={(date)=>setMmOutFrom(date)} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={mmOutTo} onChange={(date)=>setMmOutTo(date)} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Other Outstandings</div>
          <div className="row g-2">
            <div className="col-md-6"><input className="form-control" placeholder="Remarks" value={mmOtherRemarks} onChange={(e)=>setMmOtherRemarks(e.target.value)} /></div>
            <div className="col-md-3"><input type="number" className="form-control" placeholder="Amount" value={mmOtherAmt} onChange={(e)=>setMmOtherAmt(Number(e.target.value||0))} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Monthly Outstandings</div>
          <div className="row g-2">
            <div className="col-md-3"><input type="number" className="form-control" placeholder="Amount" value={mmMonthlyOutAmt} onChange={(e)=>setMmMonthlyOutAmt(Number(e.target.value||0))} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Advance Maintenance</div>
          <div className="row g-2">
            <div className="col-md-3"><input type="number" className="form-control" placeholder="Amount" value={mmAdvAmt} onChange={(e)=>setMmAdvAmt(Number(e.target.value||0))} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={mmAdvFrom} onChange={(date)=>setMmAdvFrom(date)} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={mmAdvTo} onChange={(date)=>setMmAdvTo(date)} /></div>
          </div>
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





