import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditMaintenance = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getMaintenanceById, updateMaintenance, deleteMaintenance, getFlats, getUsers, getAdminMe, uploadImage } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [maintenancePurpose, setMaintenancePurpose] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');

  const [flats, setFlats] = useState([]);
  const [users, setUsers] = useState([]);
  const [flat, setFlat] = useState(null);
  const [fromUser, setFromUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [documentImages, setDocumentImages] = useState([]);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('flat'); // 'flat' or 'user'

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMaintenanceById(id);
      setMaintenancePurpose(data.maintenancePurpose || '');
      setMaintenanceAmount(data.maintenanceAmount || '');
      setFlat(data.flat || null);
      setFromUser(data.from || null);
      setDocumentImages((data.documentImages || []).map(x => x.url));
      const fs = await getFlats(); setFlats(fs || []);
      const us = await getUsers(); setUsers(us || []);
      const me = await getAdminMe(); setAdmin(me || null);
      setLoading(false);
    })();
  }, [id, getMaintenanceById, getFlats, getUsers, getAdminMe]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    if (searchType === 'flat') {
      const filtered = (flats || []).filter(f => (f.flatNumber || '').toLowerCase().includes(q.toLowerCase())).slice(0,5);
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
      setSaving(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev=>[...prev, ...urls]);
    }catch{
      toast.error('Upload failed');
    }finally{
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      const payload = {
        maintenancePurpose,
        maintenanceAmount,
        documentImages: documentImages.map(url => ({ url })),
        flat: flat?._id || flat,
        from: fromUser?._id || fromUser,
        to: admin?._id || null,
      };
      await updateMaintenance(id, payload);
      toast.success('Maintenance updated');
    }catch(err){
      toast.error(err?.message || 'Update failed');
    }finally{
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this maintenance?')) return;
    try{
      setDeleting(true);
      await deleteMaintenance(id);
      toast.success('Maintenance deleted');
      history.push('/dashboard/maintenance');
    }catch(err){
      toast.error(err?.message || 'Delete failed');
    }finally{
      setDeleting(false);
    }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-6">Edit Maintanance</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Maintenance Purpose</h5>
        <input value={maintenancePurpose} onChange={(e)=>setMaintenancePurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Maintenance Amount</h5>
        <input value={maintenanceAmount} onChange={(e)=>setMaintenanceAmount(e.target.value)} className="form-control" placeholder="Amount" />

        <h5 className="mt-3">Flat</h5>
        {!flat && (
          <>
            <input value={searchType==='flat'?search:''} onChange={(e)=>{setSearchType('flat'); onSearch(e.target.value)}} className="form-control" placeholder="Search flat..." />
            {searchType==='flat' && search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(f => (
                  <li key={f._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setFlat(f); setSearch(''); setResults([]); }}>
                    Flat {f.flatNumber}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {flat && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>Flat {flat.flatNumber || flat}</span>
              <button type="button" className="btn-close" onClick={()=>setFlat(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">From (User)</h5>
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
              <span>{fromUser.userName || fromUser} ({fromUser.userMobile || ''})</span>
              <button type="button" className="btn-close" onClick={()=>setFromUser(null)} />
            </div>
          </div>
        )}

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

export default EditMaintenance;


