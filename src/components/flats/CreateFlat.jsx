import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import VariantsManager from '../variantManager';
import UserSearchBox from './UserSearchBox';

const CreateFlat = () => {
  const { getUsers, createFlat, uploadImage } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [flatNumber, setFlatNumber] = useState('');
  const [rented, setRented] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Owner');

  // Search & select users
  const [users, setUsers] = useState([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerResults, setOwnerResults] = useState([]);
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantResults, setTenantResults] = useState([]);
  const [renterSearch, setRenterSearch] = useState('');
  const [renterResults, setRenterResults] = useState([]);

  const [owners, setOwners] = useState([]); // [{ user, owned }]
  const [tenant, setTenant] = useState([]); // [{ user, active }]
  const [renter, setRenter] = useState([]); // [{ user, active }]

  // CNICs & Vehicles via VariantsManager
  const [cnics, setCnics] = useState([]);       // map -> {cnicName:variant, cnicNumber:price}
  const [vehicles, setVehicles] = useState([]); // map -> {vehicleName:variant, vehicleNumber:price}

  const [documentImages, setDocumentImages] = useState([]); // urls
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);

  useEffect(() => {
    (async () => {
      const list = await getUsers();
      setUsers(list || []);
    })();
  }, [getUsers]);

  const makeSearch = (q, setQuery, setRes) => {
    setQuery(q);
    if (!q.trim()) return setRes([]);
    const filtered = (users || []).filter(u =>
      u.userName?.toLowerCase().includes(q.toLowerCase()) ||
      String(u.userMobile || '').includes(q)
    ).slice(0, 5);
    setRes(filtered);
  };

  const addOwner = (u) => {
    if (owners.find(x => x.user._id === u._id)) return;
    setOwners([...owners, { user: u, owned: true }]);
    setOwnerSearch(''); setOwnerResults([]);
  };
  const addTenant = (u) => {
    if (tenant.find(x => x.user._id === u._id)) return;
    setTenant([...tenant, { user: u, active: true }]);
    setTenantSearch(''); setTenantResults([]);
  };
  const addRenter = (u) => {
    if (renter.find(x => x.user._id === u._id)) return;
    setRenter([...renter, { user: u, active: true }]);
    setRenterSearch(''); setRenterResults([]);
  };

  const removeFrom = (arr, setArr, id) => setArr(arr.filter(x => x.user._id !== id));

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
        owners: owners.map(x => ({ user: x.user._id, owned: !!x.owned })),
        rented,
        activeStatus,
        tenant: tenant.map(x => ({ user: x.user._id, active: !!x.active })),
        renter: renter.map(x => ({ user: x.user._id, active: !!x.active })),
        residentsCnics: cnics.map(x => ({ cnicName: x.variant, cnicNumber: x.price })),
        vehicleNo: vehicles.map(x => ({ vehicleName: x.variant, vehicleNumber: x.price })),
        documentImages: documentImages.map(url => ({ url })),
      };
      const created = await createFlat(payload);
      if (created?._id) {
        toast.success('Flat created');
        history.push(`/dashboard/edit-flat/${created._id}`);
      } else {
        throw new Error('Create failed');
      }
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
        <h5 className="mt-3">Flat Number</h5>
        <input value={flatNumber} onChange={(e)=>setFlatNumber(e.target.value)} className="form-control" placeholder="e.g., A-101" />

        <h5 className="mt-3">Rented</h5>
        <BadgeToggle active={rented} on="Rented" off="Owned" onClick={setRented} />

        <h5 className="mt-3">Active Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn btn-${activeStatus==='Tenant'?'primary':'outline-primary'}`} onClick={()=>setActiveStatus('Tenant')}>Tenant</button>
          <button type="button" className={`btn btn-${activeStatus==='Owner'?'primary':'outline-primary'} ms-2`} onClick={()=>setActiveStatus('Owner')}>Owner</button>
        </div>

        <h5 className="mt-4">Owners</h5>
        <UserSearchBox
          value={ownerSearch}
          onChange={(q)=>makeSearch(q, setOwnerSearch, setOwnerResults)}
          results={ownerResults}
          onPick={addOwner}
        />
        {owners.map((o) => (
          <UserCard
            key={o.user._id}
            row={o}
            right={<BadgeToggle active={o.owned} on="Owned" off="Not Owned" onClick={(v)=>setOwners(owners.map(x=>x.user._id===o.user._id?{...x, owned:v}:x))} onRemove={(id)=>removeFrom(owners,setOwners,id)} />}
          />
        ))}

        <h5 className="mt-4">Tenant</h5>
        <UserSearchBox
          value={tenantSearch}
          onChange={(q)=>makeSearch(q, setTenantSearch, setTenantResults)}
          results={tenantResults}
          onPick={addTenant}
        />
        {tenant.map((t) => (
          <UserCard
            key={t.user._id}
            row={t}
            right={<BadgeToggle active={t.active} on="Active" off="Inactive" onClick={(v)=>setTenant(tenant.map(x=>x.user._id===t.user._id?{...x, active:v}:x))} onRemove={(id)=>removeFrom(tenant,setTenant,id)} />}
          />
        ))}

        <h5 className="mt-4">Renter</h5>
        <UserSearchBox
          value={renterSearch}
          onChange={(q)=>makeSearch(q, setRenterSearch, setRenterResults)}
          results={renterResults}
          onPick={addRenter}
        />
        {renter.map((r) => (
          <UserCard
            key={r.user._id}
            row={r}
            right={<BadgeToggle active={r.active} on="Active" off="Inactive" onClick={(v)=>setRenter(renter.map(x=>x.user._id===r.user._id?{...x, active:v}:x))} onRemove={(id)=>removeFrom(renter,setRenter,id)} />}
          />
        ))}

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
          <button disabled={loading} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Flat'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateFlat;


