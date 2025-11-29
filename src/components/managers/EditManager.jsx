import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditManager = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getManagerById, updateManager, deleteManager, getAdminMe } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [me, setMe] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [payOnlyShopMaintenance, setPayOnlyShopMaintenance] = useState(false);
  const [changeAllAmounts, setChangeAllAmounts] = useState(false);
  const [payAllAmounts, setPayAllAmounts] = useState(false);
  const [salariesDistribution, setSalariesDistribution] = useState(false);
  const [lumpSumAmounts, setLumpSumAmounts] = useState(false);
  const [editRole, setEditRole] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
      const m = await getManagerById(id);
      if (m){
        setFullName(m.fullName || '');
        setEmail(m.email || '');
        setRole(m.role || '');
        setPayOnlyShopMaintenance(!!m.payOnlyShopMaintenance);
        setChangeAllAmounts(!!m.changeAllAmounts);
        setPayAllAmounts(!!m.payAllAmounts);
        setSalariesDistribution(!!m.salariesDistribution);
        setLumpSumAmounts(!!m.lumpSumAmounts);
        setEditRole(typeof m.editRole === 'boolean' ? m.editRole : true);
      }
      setLoading(false);
    })();
  }, [id, getManagerById, getAdminMe]);

  const ensureAdmin = () => {
    if (me?.email !== 'admin@lakhanitowers.com') { toast.error('Admin only'); return false; }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!ensureAdmin()) return;
    try{
      setSaving(true);
      const payload = { fullName, email, role, ...(password?{password}:{}), payOnlyShopMaintenance, changeAllAmounts, payAllAmounts, salariesDistribution, lumpSumAmounts, editRole };
      await updateManager(id, payload);
      toast.success('Manager updated');
    }catch(err){ toast.error(err?.message || 'Update failed'); }finally{ setSaving(false); }
  };

  const onDelete = async () => {
    if (!ensureAdmin()) return;
    if (!window.confirm('Delete manager?')) return;
    try{
      setDeleting(true);
      await deleteManager(id);
      toast.success('Manager deleted');
      history.push('/dashboard/managers');
    }catch(err){ toast.error(err?.message || 'Delete failed'); }finally{ setDeleting(false); }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit Manager</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Full Name</h5>
        <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="form-control" placeholder="Full name" />
        <h5 className="mt-3">Email</h5>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} className="form-control" placeholder="Email" type="email" />
        <h5 className="mt-3">Password (leave blank to keep)</h5>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} className="form-control" placeholder="Password" type="password" />
        <h5 className="mt-3">Role</h5>
        <input value={role} onChange={(e)=>setRole(e.target.value)} className="form-control" placeholder="e.g., Manager" />

        <h5 className="mt-3">Permissions</h5>
        <div className="form-check form-switch m-2">
          <input className="form-check-input" type="checkbox" checked={editRole} onChange={(e)=>setEditRole(e.target.checked)} id="editRole" />
          <label className="form-check-label" htmlFor="editRole">Edit Role (full edit)</label>
        </div>
        <div className="form-check form-switch m-2">
          <input className="form-check-input" type="checkbox" checked={payOnlyShopMaintenance} onChange={(e)=>setPayOnlyShopMaintenance(e.target.checked)} id="payOnlyShopMaintenance" />
          <label className="form-check-label" htmlFor="payOnlyShopMaintenance">Pay Only Shop Maintenance</label>
        </div>
        <div className="form-check form-switch m-2">
          <input className="form-check-input" type="checkbox" checked={changeAllAmounts} onChange={(e)=>setChangeAllAmounts(e.target.checked)} id="changeAllAmounts" />
          <label className="form-check-label" htmlFor="changeAllAmounts">Change All Amounts</label>
        </div>
        <div className="form-check form-switch m-2">
          <input className="form-check-input" type="checkbox" checked={payAllAmounts} onChange={(e)=>setPayAllAmounts(e.target.checked)} id="payAllAmounts" />
          <label className="form-check-label" htmlFor="payAllAmounts">Pay All Amounts</label>
        </div>
        <div className="form-check form-switch m-2">
          <input className="form-check-input" type="checkbox" checked={salariesDistribution} onChange={(e)=>setSalariesDistribution(e.target.checked)} id="salariesDistribution" />
          <label className="form-check-label" htmlFor="salariesDistribution">Salaries Distribution</label>
        </div>
        <div className="form-check form-switch m-2">
          <input className="form-check-input" type="checkbox" checked={lumpSumAmounts} onChange={(e)=>setLumpSumAmounts(e.target.checked)} id="lumpSumAmounts" />
          <label className="form-check-label" htmlFor="lumpSumAmounts">Lumpsum Amounts</label>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button type="button" disabled={deleting} onClick={onDelete} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditManager;




