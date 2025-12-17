import React, { useContext, useEffect, useMemo, useState } from 'react';
import AppContext from '../context/appContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReceiveEvents = () => {
  const { getEvents, receiveEventAmount, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [me, setMe] = useState(null);
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [item, setItem] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async()=>{ setMe(await getAdminMe()); setLoading(false); })(); }, [getAdminMe]);
  useEffect(() => { (async()=> setList((await getEvents())||[]))(); }, [getEvents]);

  const results = useMemo(()=>{
    const s = String(q||'').trim().toLowerCase();
    if (!s) return [];
    return (list||[]).filter(m =>
      String(m.GivenFrom||'').toLowerCase().includes(s) ||
      String(m.Event||'').toLowerCase().includes(s)
    ).slice(0,8);
  }, [list, q]);

  const exceeds = Number(amount||0) > Number(item?.amount||0);
  const remaining = Math.max(0, Number(item?.amount||0) - Number(amount||0));
  const isZero = Number(amount||0) <= 0;

  const onReceive = async () => {
    try{
      setSaving(true);
      if (!item?._id) return toast.error('Select an event');
      if (exceeds || isZero) return toast.error('Enter valid amount');
      await receiveEventAmount(item._id, Number(amount||0));
      toast.success('Amount received');
      const params = new URLSearchParams();
      params.set('eventId', item._id);
      params.set('givenFrom', String(item.GivenFrom||''));
      params.set('eventName', String(item.Event||''));
      params.set('amount', String(amount||0));
      params.set('date', new Date().toISOString());
      history.push(`/pdf/receive-event?${params.toString()}`);
    }catch(err){ toast.error(err?.message||'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: 60, height: 60 }} className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-5" style={{ fontWeight: 900 }}>Receive Events</h1>
      {!item && (
        <>
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control mt-3" placeholder="Search by Given From / Event..." />
          {q.trim() && results.length>0 && (
            <ul className="list-group my-2">
              {results.map(m=>(
                <li key={m._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setItem(m); setQ(''); }}>
                  {m.GivenFrom} — {m.Event} — Remaining: {Number(m.amount||0).toLocaleString('en-PK')} PKR
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {item && (
        <>
          <div className="list-group my-2">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <span>{item.GivenFrom} — {item.Event}</span>
              <button type="button" className="btn-close" onClick={()=>setItem(null)} />
            </div>
            <div className="list-group-item">
              Remaining Amount: {remaining.toLocaleString('en-PK')} PKR
            </div>
          </div>
          <h5 className="mt-3">Amount</h5>
          <input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value||0))} className="form-control" placeholder="Amount to receive" />
          {exceeds && <div className="text-danger small mt-1">Amount exceeds remaining</div>}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-outline-success" onClick={onReceive} disabled={saving || !item?._id || exceeds || isZero || (me && me.role==='manager' && me.editRole===false)}>
              {saving && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
              {saving ? 'Processing...' : 'Receive'}
            </button>
          </div>
        </>
      )}
      <ToastContainer/>
    </div>
  );
};

export default ReceiveEvents;


