import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditMiscExpense = () => {
  const { id } = useParams();
  const { getMiscExpenseById, updateMiscExpense, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [givenTo, setGivenTo] = useState('');
  const [lineItem, setLineItem] = useState('');
  const [remarks, setRemarks] = useState('');
  const [amount, setAmount] = useState(0);
  const [dateOfCreation, setDateOfCreation] = useState(new Date());

  useEffect(()=>{ (async()=>{
    setMe(await getAdminMe());
    const item = await getMiscExpenseById(id);
    setGivenTo(item?.GivenTo || '');
    setLineItem(item?.lineItem || '');
    setRemarks(item?.remarks || '');
    setAmount(item?.amount || 0);
    // paidAmount handled via payments, hidden on edit form
    setDateOfCreation(item?.dateOfCreation ? new Date(item.dateOfCreation) : new Date());
  })(); }, [id, getMiscExpenseById, getAdminMe]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      if (!givenTo || !lineItem) return toast.error('Enter Given To and Line Item');
      const payload = { GivenTo: givenTo, lineItem, remarks, amount: Number(amount||0), dateOfCreation };
      await updateMiscExpense(id, payload);
      toast.success('Updated expense');
      setTimeout(()=> history.push('/dashboard/misc-expenses'), 500);
    }catch(err){
      toast.error(err?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  return (
    <div className="container py-3">
      <h1 className="display-5" style={{ fontWeight: 900 }}>Misc Expense Record</h1>
      <form className="mt-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Given To</label>
            <input className="form-control" value={givenTo} onChange={(e)=>setGivenTo(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Line Item</label>
            <input className="form-control" value={lineItem} onChange={(e)=>setLineItem(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" value={amount} onChange={(e)=>setAmount(e.target.value)} disabled={(String(me?.role||'').toLowerCase()==='manager' && ((me?.editRole===false || me?.editRole==='false') || !(me?.changeAllAmounts===true || me?.changeAllAmounts==='true')))} />
          </div>

          <div className="col-md-4">
            <label className="form-label">Date Of Creation</label>
            <DatePicker className="form-control" selected={dateOfCreation} onChange={setDateOfCreation} placeholderText="dd/mm/yy" dateFormat="dd/MM/yy" />
          </div>
          <div className="col-12">
            <label className="form-label">Remarks</label>
            <textarea className="form-control" rows="3" value={remarks} onChange={(e)=>setRemarks(e.target.value)} />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-outline-success" disabled={saving || (String(me?.role||'').toLowerCase()==='manager' && (me?.editRole===false || me?.editRole==='false'))}>
            {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditMiscExpense;


