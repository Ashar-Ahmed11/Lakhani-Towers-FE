import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditCustomHeader = () => {
  const { id } = useParams();
  const history = useHistory();
  const { customHeaders, getCustomHeaders, updateCustomHeader, deleteCustomHeader } = useContext(AppContext);
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    (async ()=>{
      if (!customHeaders?.length) await getCustomHeaders();
      const h = (customHeaders || []).find(x => x._id === id);
      setHeader(h);
    })();
  }, [id, customHeaders, getCustomHeaders]);

  const onSave = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      await updateCustomHeader(id, {
        headerName: header.headerName,
        headerType: header.headerType,
        recurring: !!header.recurring
      });
      toast.success('Header updated');
    }finally{
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try{
      setLoading(true);
      await deleteCustomHeader(id);
      toast.success('Header deleted');
      history.push('/dashboard/custom-headers');
    }finally{
      setLoading(false);
    }
  };

  if (!header) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-6">Edit Custom Header</h1>
      <form onSubmit={onSave}>
        <h5 className="mt-3">Header Name</h5>
        <input value={header.headerName} onChange={(e)=>setHeader({...header, headerName:e.target.value})} className="form-control" />

        <h5 className="mt-3">Header Type</h5>
        <select value={header.headerType} onChange={(e)=>setHeader({...header, headerType:e.target.value})} className="form-select">
          <option>Expense</option>
          <option>Incoming</option>
        </select>

        <div className="form-check form-switch my-3">
          <input className="form-check-input" type="checkbox" id="recurringSwitch" checked={!!header.recurring} onChange={(e)=>setHeader({...header, recurring:e.target.checked})} />
          <label className="form-check-label" htmlFor="recurringSwitch">Recurring</label>
        </div>

        <div className="d-flex justify-content-between mt-3">
          <button type="button" disabled={loading} onClick={()=>setShowDelete(true)} className="btn btn-danger">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={loading} className="btn btn-outline-primary">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>

      {showDelete && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={()=>setShowDelete(false)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this header?</p>
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

export default EditCustomHeader;


