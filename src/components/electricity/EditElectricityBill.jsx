import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditElectricityBill = () => {
  const { id } = useParams();
  const { getElectricityBillById, updateElectricityBill, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [paying, setPaying] = useState(false);
  const [me, setMe] = useState(null);
  const [consumerNumber, setConsumerNumber] = useState('');
  const [monthlyBill, setMonthlyBill] = useState(0);
  const [monthlyPayables, setMonthlyPayables] = useState(0);
  const [dateOfCreation, setDateOfCreation] = useState(new Date());

  useEffect(()=>{ (async()=>{
    setMe(await getAdminMe());
    const item = await getElectricityBillById(id);
    setConsumerNumber(item?.consumerNumber || '');
    setMonthlyBill(item?.BillRecord?.MonthlyBill || 0);
    setMonthlyPayables(item?.BillRecord?.monthlyPayables?.amount || 0);
    setDateOfCreation(item?.dateOfCreation ? new Date(item.dateOfCreation) : new Date());
  })(); }, [id, getElectricityBillById, getAdminMe]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setPaying(true);
      const payload = {
        consumerNumber: Number(consumerNumber),
        dateOfCreation,
        BillRecord: {
          MonthlyBill: Number(monthlyBill||0),
          monthlyPayables: { amount: Number(monthlyPayables||0) },
        }
      };
      await updateElectricityBill(id, payload);
      toast.success('Updated electricity bill');
      setTimeout(()=> history.push('/dashboard/electricity-bills'), 500);
    }catch(err){
      toast.error(err?.message || 'Failed to update');
    } finally { setPaying(false); }
  };

  return (
    <div className="container py-3">
      <h1 className="display-5" style={{ fontWeight: 900 }}>Electricity Bill Record</h1>
      <form className="mt-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Consumer Number</label>
            <input type="number" className="form-control" value={consumerNumber} onChange={(e)=>setConsumerNumber(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Monthly Bill</label>
          <input type="number" className="form-control" value={monthlyBill} onChange={(e)=>setMonthlyBill(e.target.value)} disabled={(String(me?.role||'').toLowerCase()==='manager' && ((me?.editRole===false || me?.editRole==='false') || !(me?.changeAllAmounts===true || me?.changeAllAmounts==='true')))} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Monthly Payables</label>
            <input type="number" className="form-control" value={monthlyPayables} onChange={(e)=>setMonthlyPayables(e.target.value)} disabled={(String(me?.role||'').toLowerCase()==='manager' && ((me?.editRole===false || me?.editRole==='false') || !(me?.changeAllAmounts===true || me?.changeAllAmounts==='true')))} />
          </div>

          <div className="col-md-4">
            <label className="form-label">Date Of Creation</label>
            <DatePicker className="form-control" selected={dateOfCreation} onChange={setDateOfCreation} placeholderText="dd/mm/yy" dateFormat="dd/MM/yy" />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-outline-success" disabled={paying || (String(me?.role||'').toLowerCase()==='manager' && (me?.editRole===false || me?.editRole==='false'))}>
            {paying && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            {paying ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default EditElectricityBill;


