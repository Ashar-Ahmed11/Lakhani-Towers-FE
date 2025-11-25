import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateManager = () => {
  const { createManager, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [payOnlyShopMaintenance, setPayOnlyShopMaintenance] = useState(false);
  const [changeAllAmounts, setChangeAllAmounts] = useState(false);
  const [payAllAmounts, setPayAllAmounts] = useState(false);
  const [salariesDistribution, setSalariesDistribution] = useState(false);
  const [lumpSumAmounts, setLumpSumAmounts] = useState(false);
  const [editRole, setEditRole] = useState(true);

  useEffect(()=>{ (async()=> setMe(await getAdminMe()))() }, [getAdminMe]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (me?.email !== 'admin@lakhanitowers.com') return toast.error('Only admin can create managers');
    try{
      setLoading(true);
      const payload = { fullName, email, password, payOnlyShopMaintenance, changeAllAmounts, payAllAmounts, salariesDistribution, lumpSumAmounts, editRole };
      const res = await createManager(payload);
      if (res?._id){ toast.success('Manager created'); history.push('/dashboard/managers'); }
      else throw new Error('Create failed');
    }catch(err){ toast.error(err?.message || 'Error'); }finally{ setLoading(false); }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Manager</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Full Name</h5>
        <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="form-control" placeholder="Full name" />
        <h5 className="mt-3">Email</h5>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} className="form-control" placeholder="Email" type="email" />
        <h5 className="mt-3">Password</h5>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} className="form-control" placeholder="Password" type="password" />

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

        <div className="d-flex justify-content-end mt-4">
          <button disabled={loading} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Manager'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateManager;


