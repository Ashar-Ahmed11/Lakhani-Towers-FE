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
  const [me, setMe] = useState(null);
  const [toUser, setToUser] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [status, setStatus] = useState('Pending');
  const didInitRef = useRef(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async()=>{
      setMe(await getAdminMe());
      const loan = await getLoanById(id);
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
  const isAdmin = me && me.email === 'admin@lakhanitowers.com';
  const isManager = me && me.role === 'manager';
  const editLocked = isManager && me && (me.editRole === false);
  const canToggleStatus = isAdmin || (isManager && (me.editRole || me.payAllAmounts));
  const canEditAmount = isAdmin || (isManager && (me.editRole || me.changeAllAmounts));
  const canSave = isAdmin || (isManager && (me.editRole || me.changeAllAmounts || me.payAllAmounts));

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      await updateLoan(id, { to: toUser?._id || toUser, purpose, amount: Number(amount||0), status, date });
      toast.success('Loan updated');
    }catch(err){
      toast.error(err?.message || 'Update failed');
    }finally{
      setLoading(false);
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
        <input disabled={!(isAdmin || (isManager && me.editRole))} value={purpose} onChange={(e)=>setPurpose(e.target.value)} className="form-control" placeholder="Purpose" />

        <h5 className="mt-3">Amount</h5>
        <input disabled={!canEditAmount} value={amount} onChange={(e)=>setAmount(e.target.value)} className="form-control" placeholder="Amount" type="number" />

        <h5 className="mt-3">Date</h5>
        <DatePicker disabled={!(isAdmin || (isManager && me.editRole))} dateFormat="dd/MM/yyyy" className='form-control' selected={date} onChange={setDate} />

        <h5 className="mt-3">Status</h5>
        <div className="btn-group">
          <button disabled={!canToggleStatus} type="button" className={`btn ${status==='Pending'?'btn-warning':'btn-outline-warning'}`} onClick={()=>setStatus('Pending')}>Pending</button>
          <button disabled={!canToggleStatus} type="button" className={`btn ${status==='Paid'?'btn-success':'btn-outline-success'} ms-2`} onClick={()=>setStatus('Paid')}>Paid</button>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button type="button" disabled={loading || !isAdmin} onClick={()=>setShowDelete(true)} className="btn btn-danger">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={loading || !canSave} className="btn btn-outline-primary">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
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





