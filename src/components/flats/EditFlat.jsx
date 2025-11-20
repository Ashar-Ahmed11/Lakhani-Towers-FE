import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import VariantsManager from '../variantManager';
import UserSearchBox from './UserSearchBox';

const EditFlat = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getFlatById, updateFlat, deleteFlat, getUsers, uploadImage } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [flatNumber, setFlatNumber] = useState('');
  const [rented, setRented] = useState(false);
  const [activeStatus, setActiveStatus] = useState('Owner');

  const [users, setUsers] = useState([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [ownerResults, setOwnerResults] = useState([]);
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantResults, setTenantResults] = useState([]);
  const [renterSearch, setRenterSearch] = useState('');
  const [renterResults, setRenterResults] = useState([]);

  const [owners, setOwners] = useState([]);
  const [tenant, setTenant] = useState([]);
  const [renter, setRenter] = useState([]);

  const [cnics, setCnics] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [documentImages, setDocumentImages] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getFlatById(id);
      setFlatNumber(data.flatNumber || '');
      setRented(!!data.rented);
      setActiveStatus(data.activeStatus || 'Owner');
      setOwners((data.owners || []).map(x => ({ user: x.user, owned: !!x.owned })));
      setTenant((data.tenant || []).map(x => ({ user: x.user, active: !!x.active })));
      setRenter((data.renter || []).map(x => ({ user: x.user, active: !!x.active })));
      setCnics((data.residentsCnics || []).map(x => ({ variant: x.cnicName, price: x.cnicNumber })));
      setVehicles((data.vehicleNo || []).map(x => ({ variant: x.vehicleName, price: x.vehicleNumber })));
      setDocumentImages((data.documentImages || []).map(x => x.url));
      const list = await getUsers();
      setUsers(list || []);
      setLoading(false);
    })();
  }, [id, getFlatById, getUsers]);

  const makeSearch = (q, setQuery, setRes) => {
    setQuery(q);
    if (!q.trim()) return setRes([]);
    const filtered = (users || []).filter(u =>
      u.userName?.toLowerCase().includes(q.toLowerCase()) ||
      String(u.userMobile || '').includes(q)
    ).slice(0, 5);
    setRes(filtered);
  };

  const addTo = (arr, setArr, u, key, section) => {
    if (arr.find(x => (x.user._id || x.user) === u._id)) return;
    const base = key === 'owned' ? { owned: true } : { active: true };
    setArr([...arr, { user: u, ...base }]);
    if (section === 'owners') { setOwnerSearch(''); setOwnerResults([]); }
    if (section === 'tenant') { setTenantSearch(''); setTenantResults([]); }
    if (section === 'renter') { setRenterSearch(''); setRenterResults([]); }
  };

  const removeFrom = (arr, setArr, id) => setArr(arr.filter(x => (x.user._id || x.user) !== id));

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
        owners: owners.map(x => ({ user: (x.user._id || x.user), owned: !!x.owned })),
        rented,
        activeStatus,
        tenant: tenant.map(x => ({ user: (x.user._id || x.user), active: !!x.active })),
        renter: renter.map(x => ({ user: (x.user._id || x.user), active: !!x.active })),
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

  const BadgeToggle = ({ active, on, off, onClick }) => (
    <div className="btn-group">
      <button type="button" className={`btn btn-${active ? 'primary':'outline-primary'}`} onClick={()=>onClick(true)}>{on}</button>
      <button type="button" className={`btn btn-${!active ? 'primary':'outline-primary'} ms-2`} onClick={()=>onClick(false)}>{off}</button>
    </div>
  );

  // moved SearchBox to a stable component to avoid input remount/focus loss

  const UserCard = ({ row, right }) => (
    <div className="card border-0 shadow-sm p-2 my-2">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h6 className="mb-1">{(row.user.userName || row.user)}</h6>
        </div>
        <div className="d-flex align-items-center gap-2">
          {right}
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={()=>right.props.onRemove((row.user._id || row.user))}>Remove</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-3">
      <h1 className="display-6">Edit Flat</h1>
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
          onPick={(u)=>addTo(owners,setOwners,u,'owned','owners')}
        />
        {owners.map((o) => (
          <UserCard
            key={(o.user._id || o.user)}
            row={o}
            right={<BadgeToggle active={o.owned} on="Owned" off="Not Owned" onClick={(v)=>setOwners(owners.map(x=>(x.user._id||x.user)===(o.user._id||o.user)?{...x, owned:v}:x))} onRemove={(id)=>removeFrom(owners,setOwners,id)} />}
          />
        ))}

        <h5 className="mt-4">Tenant</h5>
        <UserSearchBox
          value={tenantSearch}
          onChange={(q)=>makeSearch(q, setTenantSearch, setTenantResults)}
          results={tenantResults}
          onPick={(u)=>addTo(tenant,setTenant,u,'active','tenant')}
        />
        {tenant.map((t) => (
          <UserCard
            key={(t.user._id || t.user)}
            row={t}
            right={<BadgeToggle active={t.active} on="Active" off="Inactive" onClick={(v)=>setTenant(tenant.map(x=>(x.user._id||x.user)===(t.user._id||t.user)?{...x, active:v}:x))} onRemove={(id)=>removeFrom(tenant,setTenant,id)} />}
          />
        ))}

        <h5 className="mt-4">Renter</h5>
        <UserSearchBox
          value={renterSearch}
          onChange={(q)=>makeSearch(q, setRenterSearch, setRenterResults)}
          results={renterResults}
          onPick={(u)=>addTo(renter,setRenter,u,'active','renter')}
        />
        {renter.map((r) => (
          <UserCard
            key={(r.user._id || r.user)}
            row={r}
            right={<BadgeToggle active={r.active} on="Active" off="Inactive" onClick={(v)=>setRenter(renter.map(x=>(x.user._id||x.user)===(r.user._id||r.user)?{...x, active:v}:x))} onRemove={(id)=>removeFrom(renter,setRenter,id)} />}
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
          {saving && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {documentImages.map((url, idx)=>(
            <div key={idx} className="position-relative">
              <img src={url} alt="doc" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <span onClick={()=>setDocumentImages(documentImages.filter((_,i)=>i!==idx))} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button onClick={onDelete} type="button" disabled={deleting} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditFlat;


