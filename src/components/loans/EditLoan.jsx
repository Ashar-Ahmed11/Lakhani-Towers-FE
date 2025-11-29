import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditLoan = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getLoanById, updateLoan, deleteLoan, getAdminMe } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toUser, setToUser] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [status, setStatus] = useState('Pending');
  const didInitRef = useRef(false);
  const [showDelete, setShowDelete] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async()=>{
      const [loan, meRes] = await Promise.all([getLoanById(id), getAdminMe()]);
      setMe(meRes || null);
      if (loan){
        setToUser(loan.to || null);
        setPurpose(loan.purpose || '');
        setAmount(loan.amount || '');
        setDate(loan.date ? new Date(loan.date) : new Date());
        setStatus(loan.status || 'Pending');
      }
      setLoading(false);
    })();
  }, [id, getLoanById, getAdminMe]);

  const isAdmin = !!me && me.email === 'admin@lakhanitowers.com';
  const isManager = !!me && (((me.role || '').toLowerCase() === 'manager') || typeof me.editRole === 'boolean');
  const canEditGeneral = isAdmin || (isManager && me.editRole);
  const canEditAmounts = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canToggleStatus = isAdmin || (isManager && (me.editRole || me.payAllAmounts));
  const canSave = isAdmin || (isManager && (me.editRole || me.changeAllAmounts || me.payAllAmounts));
  const canDelete = isAdmin;

  const updateStatus = async (nextStatus) => {
    const prev = status;
    setStatus(nextStatus);
    try{
      setSaving(true);
      await updateLoan(id, { to: toUser?._id || toUser, purpose, amount: Number(amount||0), status: nextStatus, date });
      toast.success('Status updated');
    }catch(err){
      setStatus(prev);
      toast.error(err?.message || 'Update failed');
    }finally{
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      await updateLoan(id, { to: toUser?._id || toUser, purpose, amount: Number(amount||0), status, date });
      toast.success('Loan updated');
    }catch(err){
      toast.error(err?.message || 'Update failed');
    }finally{
      setSaving(false);
    }
  };

  const onDelete = async () => {
    try{
      setLoading(true);
      await deleteLoan(id);
      toast.success('Loan deleted');
      history.push('/dashboard/loans');
    }finally{
      setLoading(false);
    }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Edit Loan</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">To User</h5>
        <div className="list-group my-2">
          <div className="list-group-item active d-flex justify-content-between align-items-center">
            <span>{toUser?.userName} ({toUser?.userMobile || ''})</span>
          </div>
        </div>

        <h5 className="mt-3">Purpose</h5>
        <input disabled={!canEditGeneral} value={purpose} onChange={(e)=>setPurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Amount</h5>
        <input disabled={!canEditAmounts} value={amount} onChange={(e)=>setAmount(e.target.value)} className="form-control" placeholder="Amount" type="number" />

        <h5 className="mt-3">Date</h5>
        <DatePicker disabled={!canEditGeneral} dateFormat="dd/MM/yyyy" className='form-control' selected={date} onChange={setDate} />

        <h5 className="mt-3">Status</h5>
        <div className="btn-group">
          <button type="button" className={`btn ${status==='Pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>updateStatus('Pending')} disabled={saving || !canToggleStatus}>Pending</button>
          <button type="button" className={`btn ${status==='Paid'?'btn-success':'btn-outline-success'} ms-2`} onClick={()=>updateStatus('Paid')} disabled={saving || !canToggleStatus}>Paid</button>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button type="button" disabled={saving || !canDelete} onClick={()=>setShowDelete(true)} className="btn btn-danger">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <div className="d-flex gap-2">
            {status === 'Paid' ? (
              <button type="button" disabled={saving} onClick={()=>window.open(`/pdf/loans/${id}`,'_blank')} className="btn btn-secondary">
                {saving ? <span className="spinner-border spinner-border-sm"></span> : 'Print'}
              </button>
            ) : null}
            <button disabled={saving || !canSave} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
          </div>
        </div>

        {showDelete && (
          <div className="modal fade show" tabIndex="-1" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={()=>setShowDelete(false)} />
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this loan?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={()=>setShowDelete(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={onDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditLoan;





