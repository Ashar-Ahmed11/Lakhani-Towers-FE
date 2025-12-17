import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateElectricityBill = () => {
  const { createElectricityBill, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [paying, setPaying] = useState(false);
  const [me, setMe] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [consumerNumber, setConsumerNumber] = useState('');
  const [monthlyBill, setMonthlyBill] = useState(0);
  const [monthlyPayables, setMonthlyPayables] = useState(0);
  const [dateOfCreation, setDateOfCreation] = useState(new Date());

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      const m = await getAdminMe(); setMe(m || null);
      if (m && m.role === 'manager' && m.editRole === false) history.push('/dashboard');
      setLoadingData(false);
    })();
  }, [getAdminMe, history]);

  const dIso = (d)=> d ? new Date(d).toISOString() : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setPaying(true);
      if (!consumerNumber) return toast.error('Enter consumer number');
      const payload = {
        consumerNumber: Number(consumerNumber),
        dateOfCreation,
        BillRecord: {
          MonthlyBill: Number(monthlyBill||0),
          monthlyPayables: { amount: Number(monthlyPayables||0) },
        }
      };
      await createElectricityBill(payload);
      toast.success('Created electricity bill');
      setTimeout(()=> history.push('/dashboard/electricity-bills'), 500);
    }catch(err){
      toast.error(err?.message || 'Failed to create');
    } finally { setPaying(false); }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Electricity Bill</h1>
      {loadingData && (
        <div className="alert alert-light d-flex align-items-center gap-2 py-2">
          <span className="spinner-border spinner-border-sm"></span>
          <span>Loading...</span>
        </div>
      )}
      <form className="mt-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Consumer Number</label>
            <input type="number" className="form-control" value={consumerNumber} onChange={(e)=>setConsumerNumber(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Monthly Bill</label>
            <input type="number" className="form-control" value={monthlyBill} onChange={(e)=>setMonthlyBill(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Monthly Payables</label>
            <input type="number" className="form-control" value={monthlyPayables} onChange={(e)=>setMonthlyPayables(e.target.value)} />
          </div>

          <div className="col-md-4">
            <label className="form-label">Date Of Creation</label>
            <DatePicker className="form-control" selected={dateOfCreation} onChange={setDateOfCreation} placeholderText="dd/mm/yy" dateFormat="dd/MM/yy" />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-outline-success" disabled={paying || loadingData || (me && (typeof me.editRole==='boolean') && me.editRole===false)}>
            {paying && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            {paying ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateElectricityBill;


