import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from './context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransferOwnership = () => {
  const { getFlats, getFlatById, updateFlat, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [flats, setFlats] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [flat, setFlat] = useState(null);
  const [role, setRole] = useState('Owner'); // Owner | Tenant | Renter
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [joinDate, setJoinDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const m = await getAdminMe(); setMe(m || null);
      if (m && m.role === 'manager' && m.editRole === false) { history.push('/dashboard'); return; }
      const fs = await getFlats(); setFlats(fs || []);
      setLoading(false);
    })();
  }, [getAdminMe, getFlats, history]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const lower = q.toLowerCase();
    const list = (flats || []).filter(f => {
      const owner = f?.owner || {};
      const tenant = f?.tenant || {};
      return (String(f.flatNumber||'').toLowerCase().includes(lower)) ||
             (String(owner.userName||'').toLowerCase().includes(lower)) ||
             (String(owner.userMobile||'').includes(q)) ||
             (String(tenant.userName||'').toLowerCase().includes(lower)) ||
             (String(tenant.userMobile||'').includes(q));
    }).slice(0,7);
    setResults(list);
  };

  const doTransfer = async () => {
    try{
      if (!flat?._id) { toast.error('Please select a flat'); return; }
      if (!name && !phone && !cnic) { toast.error('Enter new occupant details'); return; }
      setLoading(true);
      const full = await getFlatById(flat._id);
      const payload = {};
      if (role === 'Owner') {
        const prev = Array.isArray(full.previousOwners) ? full.previousOwners : [];
        if (full.owner && (full.owner.userName || full.owner.userMobile || full.owner.cnicNumber)) payload.previousOwners = [...prev, full.owner];
        payload.owner = { userName: name, userMobile: Number(phone||0), cnicNumber: cnic || '', dateOfJoining: joinDate };
      } else if (role === 'Tenant') {
        const prev = Array.isArray(full.previousTenants) ? full.previousTenants : [];
        if (full.tenant && (full.tenant.userName || full.tenant.userMobile || full.tenant.cnicNumber)) payload.previousTenants = [...prev, full.tenant];
        payload.tenant = { userName: name, userMobile: Number(phone||0), cnicNumber: cnic || '', dateOfJoining: joinDate };
      } else if (role === 'Renter') {
        const prev = Array.isArray(full.previousRenters) ? full.previousRenters : [];
        if (full.renter && (full.renter.userName || full.renter.userMobile || full.renter.cnicNumber)) payload.previousRenters = [...prev, full.renter];
        payload.renter = { userName: name, userMobile: Number(phone||0), cnicNumber: cnic || '', dateOfJoining: joinDate };
      }
      await updateFlat(full._id, payload);
      toast.success('Ownership transferred');
      history.push(`/dashboard/edit-flat/${full._id}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Transfer Ownership</h1>
      <div className="mt-3">
        {!flat && (
          <>
            <input value={search} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search flat (number, owner/tenant name or phone)..." />
            {search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(f => (
                  <li key={f._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setFlat(f); setSearch(''); setResults([]); }}>
                    {f.flatNumber} {f?.owner?.userName ? `- ${f.owner.userName}` : ''} {f?.owner?.userMobile ? `(${f.owner.userMobile})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {flat && (
          <div className="list-group my-2">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <span>Flat {flat.flatNumber}</span>
              <button type="button" className="btn-close" onClick={()=>setFlat(null)} />
            </div>
          </div>
        )}
      </div>

      <h5 className="mt-3">Role</h5>
      <div className="btn-group">
        <button type="button" className={`btn btn-${role==='Owner'?'primary':'outline-primary'}`} onClick={()=>setRole('Owner')}>Owner</button>
        <button type="button" className={`btn btn-${role==='Tenant'?'primary':'outline-primary'} ms-2`} onClick={()=>setRole('Tenant')}>Tenant</button>
        <button type="button" className={`btn btn-${role==='Renter'?'primary':'outline-primary'} ms-2`} onClick={()=>setRole('Renter')}>Renter</button>
      </div>

      <h5 className="mt-3">New {role} Details</h5>
      <input value={name} onChange={(e)=>setName(e.target.value)} className="form-control mb-2" placeholder={`${role} name`} />
      <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="form-control mb-2" placeholder={`${role} phone`} />
      <input value={cnic} onChange={(e)=>setCnic(e.target.value)} className="form-control mb-2" placeholder={`${role} CNIC`} />
      <input type="date" value={new Date(joinDate).toISOString().slice(0,10)} onChange={(e)=>setJoinDate(new Date(e.target.value))} className="form-control" placeholder="Date of Joining" />

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-outline-primary" onClick={doTransfer} disabled={loading || !flat?._id}>
          {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Transfer Ownership'}
        </button>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default TransferOwnership;


