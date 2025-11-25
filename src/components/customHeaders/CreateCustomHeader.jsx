import React, { useContext, useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const CreateCustomHeader = () => {
  const { createCustomHeader, getCustomHeaders, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [headerName, setHeaderName] = useState('');
  const [headerType, setHeaderType] = useState('Expense');
  const [recurring, setRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await getAdminMe();
      if (me && me.role === 'manager' && me.editRole === false) history.push('/dashboard');
    })();
  }, [getAdminMe, history]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const created = await createCustomHeader({ headerName, headerType, recurring });
      if (created?._id) {
        toast.success('Header created');
        await getCustomHeaders();
        setHeaderName('');
        setHeaderType('Expense');
        setRecurring(false);
      } else {
        throw new Error('Create failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Error creating header');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Custom Header</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Header Name</h5>
        <input value={headerName} onChange={(e)=>setHeaderName(e.target.value)} className="form-control" placeholder="Header Name" />

        <h5 className="mt-3">Header Type</h5>
        <select value={headerType} onChange={(e)=>setHeaderType(e.target.value)} className="form-select">
          <option>Expense</option>
          <option>Incoming</option>
        </select>

        <div className="form-check form-switch m-2">
          <input className="form-check-input" type="checkbox" id="recurringSwitch" checked={recurring} onChange={(e)=>setRecurring(e.target.checked)} />
          <label className="form-check-label" htmlFor="recurringSwitch">Recurring</label>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button disabled={loading} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateCustomHeader;


