import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditUser = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getUserById, updateUser, deleteUser, uploadImage } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      setLoading(true);
      const data = await getUserById(id);
      setUser(data);
      setLoading(false);
    })();
  }, [id]);

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setUser((prev)=>({ ...prev, userPhoto: url }));
    } catch {
      toast.error('Image upload failed');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateUser(id, user);
      toast.success('User updated');
      setUser(updated);
    } catch (err) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const [showDelete, setShowDelete] = useState(false);
  const onDelete = async () => {
    try {
      setDeleting(true);
      await deleteUser(id);
      toast.success('User deleted');
      history.push('/dashboard/users');
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !user) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const { userName, userMobile, userPhoto, incomingRecords = [], expenseRecords = [], ownerOf = [], tenantOf = [], renterOf = [] } = user;

  const CardRow = ({ title, items, right }) => (
    items.length > 0 ? (
      <div className="my-3">
        <h5 className="mb-2">{title}</h5>
        <div className="row g-3">
          {items.map((it, idx) => (
            <div key={idx} className="col-12">
              <div className="card border-0 shadow-sm p-2">
                <div className="d-flex align-items-center gap-3 flex-nowrap">
                  <div className="flex-grow-1">
                    {it.purpose ? <div className="text-muted small">Purpose: {it.purpose}</div> : null}
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-1">{right ? right(it) : (it.flat?.flatNumber || it._id)}</h6>
                    </div>
                    {Array.isArray(it.month) && it.month.length > 0 ? (
                      (() => {
                        const hasDue = it.month.some(m => m?.status === 'Due');
                        const allPaid = it.month.every(m => m?.status === 'Paid');
                        const status = hasDue ? 'Due' : (allPaid ? 'Paid' : 'Pending');
                        return <div className="text-muted small">Status: {status}</div>;
                      })()
                    ) : null}
                    {it.dateOfAddition && (
                      <div className="text-muted small">On: {new Date(it.dateOfAddition).toLocaleDateString()}</div>
                    )}
                  </div>
                  <div className="text-end" style={{ minWidth: '160px' }}>
                    {it.shopMaintenanceId ? (
                      <a href={`/dashboard/edit-shop-maintenance/${it.shopMaintenanceId}`} className="btn btn-outline-dark btn-sm">Edit</a>
                    ) : it.maintenanceId ? (
                      <a href={`/dashboard/edit-maintenance/${it.maintenanceId}`} className="btn btn-outline-dark btn-sm">Edit</a>
                    ) : it.loanId ? (
                      <a href={`/dashboard/edit-loan/${it.loanId}`} className="btn btn-outline-dark btn-sm">Edit</a>
                    ) : it.header ? (
                      <a href={`/dashboard/custom-headers/${it.header?._id}/edit-record/${it._id}`} className="btn btn-outline-dark btn-sm">Edit</a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit User</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">User Name</h5>
        <input value={userName || ''} onChange={(e)=>setUser({...user, userName: e.target.value})} className="form-control" placeholder="Full Name" />

        <h5 className="mt-3">User Photo</h5>
        <div className="input-group mb-3">
          <input onChange={onPhotoChange} type="file" className="form-control" />
          <label className="input-group-text">User Image</label>
          {saving && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        {userPhoto && (
          <div className="position-relative d-inline-block mb-2">
            <img src={userPhoto} alt="User" style={{ maxWidth: 150, borderRadius: 8 }} />
            <span onClick={()=>setUser({...user, userPhoto: null})} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
          </div>
        )}

        <h5 className="mt-3">User Mobile</h5>
        <input value={userMobile || ''} onChange={(e)=>setUser({...user, userMobile: e.target.value})} className="form-control" placeholder="03xxxxxxxxx" />

        {/* Relations (view-only) before Date of Joining */}
        <CardRow title="Owner Of" items={ownerOf} right={(it)=>`${it.flat?.flatNumber || it.shop?.shopNumber || it.flat || it.shop} (Owned: ${it.owned ? 'Yes' : 'No'})`} />
        <CardRow title="Tenant Of" items={tenantOf} right={(it)=>`${it.flat?.flatNumber || it.shop?.shopNumber || it.flat || it.shop} (Active: ${it.active ? 'Yes' : 'No'})`} />
        <CardRow title="Renter Of" items={renterOf} right={(it)=>`${it.flat?.flatNumber || it.shop?.shopNumber || it.flat || it.shop} (Active: ${it.active ? 'Yes' : 'No'})`} />

        {/* Header Records (view-only) */}
        <CardRow title="Incoming Records" items={incomingRecords} right={(it)=>`Header: ${it.header?.headerName || 'Maintanance'} | Amount: ${it.amount}`} />
        <CardRow title="Expense Records" items={expenseRecords} right={(it)=>`Header: ${it.header?.headerName || ''} | Amount: ${it.amount}`} />

        <h5 className="mt-3">Date Of Joining</h5>
        <DatePicker dateFormat="dd/MM/yyyy" className='form-control' selected={user.dateOfJoining ? new Date(user.dateOfJoining) : new Date()} onChange={(date) => setUser({...user, dateOfJoining: date})} />

        <div className="d-flex justify-content-between mt-3">
          <button onClick={()=>setShowDelete(true)} type="button" disabled={deleting} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>

      

      {/* Delete modal */}
      {showDelete && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={()=>setShowDelete(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this user?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowDelete(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={onDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer/>
    </div>
  );
};

export default EditUser;


