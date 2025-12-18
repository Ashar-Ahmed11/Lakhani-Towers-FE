import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateEvent = () => {
  const { createEvent, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [givenFrom, setGivenFrom] = useState('');
  const [eventName, setEventName] = useState('');
  const [amount, setAmount] = useState(0);
  const [dateOfCreation, setDateOfCreation] = useState(new Date());

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      const m = await getAdminMe(); setMe(m || null);
      const isManager = String(m?.role||'').toLowerCase() === 'manager' && !(String(m?.isAdmin||'').toLowerCase()==='true' || m?.isAdmin===true);
      const editDisabled = (m?.editRole===false || m?.editRole==='false');
      if (isManager && editDisabled) { history.push('/dashboard'); return; }
      setLoadingData(false);
    })();
  }, [getAdminMe, history]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      if (!givenFrom || !eventName) return toast.error('Enter Given From and Event');
      const payload = { GivenFrom: givenFrom, Event: eventName, amount: Number(amount||0), dateOfCreation };
      await createEvent(payload);
      toast.success('Created event');
      setTimeout(()=> history.push('/dashboard/events'), 500);
    }catch(err){
      toast.error(err?.message || 'Failed to create');
    } finally { setSaving(false); }
  };

  return (
    <div className="container py-3">
      <h1 className="display-5" style={{ fontWeight: 900 }}>Create Event</h1>
      <form className="mt-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Given From</label>
            <input className="form-control" value={givenFrom} onChange={(e)=>setGivenFrom(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Event</label>
            <input className="form-control" value={eventName} onChange={(e)=>setEventName(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" value={amount} onChange={(e)=>setAmount(e.target.value)} />
          </div>

          <div className="col-md-4">
            <label className="form-label">Date Of Creation</label>
            <DatePicker className="form-control" selected={dateOfCreation} onChange={setDateOfCreation} placeholderText="dd/mm/yy" dateFormat="dd/MM/yy" />
          </div>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="submit" className="btn btn-outline-success" disabled={saving || loadingData || (String(me?.role||'').toLowerCase()==='manager' && (me?.editRole===false || me?.editRole==='false'))}>
            {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateEvent;


