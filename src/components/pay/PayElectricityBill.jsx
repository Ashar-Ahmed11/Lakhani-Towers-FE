import React, { useContext, useEffect, useMemo, useState } from 'react';
import AppContext from '../context/appContext';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PayElectricityBill = () => {
  const { getElectricityBills, getElectricityBillById, payElectricityBill, getAdminMe, createReceipt } = useContext(AppContext);
  const history = useHistory();
  const [me, setMe] = useState(null);
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [bill, setBill] = useState(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => { (async()=>{ 
    const m = await getAdminMe(); setMe(m); 
    const bool = (v) => v === true || v === 'true' || v === 1 || v === '1';
    const role = String(m?.role||'').toLowerCase();
    const isAdmin = role === 'admin' || bool(m?.isAdmin);
    const isManager = role === 'manager' && !isAdmin;
    const allowed = isAdmin || bool(m?.payAllAmounts);
    if (!allowed){ history.replace('/dashboard'); return; }
    setLoading(false); 
  })(); }, [getAdminMe, history]);
  useEffect(() => { (async()=> setList((await getElectricityBills())||[]))(); }, [getElectricityBills]);

  const monthlyPayables = useMemo(()=> Number(bill?.BillRecord?.monthlyPayables?.amount || 0), [bill]);
  const remainingMonthly = useMemo(()=> Math.max(0, monthlyPayables - Number(amount||0)), [monthlyPayables, amount]);
  const exceeds = Number(amount||0) > monthlyPayables;
  const isZero = Number(amount||0) <= 0;

  const results = useMemo(()=> {
    const s = String(q||'').trim();
    if (!s) return [];
    return (list||[]).filter(b => String(b?.consumerNumber||'').includes(s)).slice(0, 8);
  }, [list, q]);

  const onPay = async () => {
    try{
      setPaying(true);
      if (!bill?._id) return toast.error('Select a bill');
      if (exceeds || isZero) return toast.error('Enter valid amount');
      await payElectricityBill(bill._id, Number(amount||0));
      toast.success('Payment recorded');
      const params = new URLSearchParams();
      params.set('billId', bill._id);
      params.set('consumerNumber', String(bill.consumerNumber || ''));
      params.set('amount', String(amount||0));
      params.set('date', new Date().toISOString());
      const slug = `/pdf/pay-electricity-bill?${params.toString()}`;
      await createReceipt({
        receiptId: bill._id, receiptModel: 'ElectricityBill',
        type: 'Paid', amount: Number(amount||0),
        receiptSlug: slug, dateOfCreation: new Date().toISOString()
      });
      try {
        const autoUrl = `${slug}${slug.includes('?') ? '&' : '?'}autoprint=1`;
        window.open(autoUrl, '_blank');
      } catch {
        history.push(slug);
      }
    }catch(err){ toast.error(err?.message||'Failed'); } finally { setPaying(false); }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: 60, height: 60 }} className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-5" style={{ fontWeight: 900 }}>Pay KE Electricity Bill</h1>
      {!bill && (
        <>
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control mt-3" placeholder="Search by consumer number..." />
          {q.trim() && results.length>0 && (
            <ul className="list-group my-2">
              {results.map(b=>(
                <li key={b._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setBill(b); setQ(''); }}>
                  {b.consumerNumber} — Monthly Payables: {Number(b?.BillRecord?.monthlyPayables?.amount||0).toLocaleString('en-PK')} PKR
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {bill && (
        <>
          <div className="list-group my-2">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <span>Consumer #{bill.consumerNumber}</span>
              <button type="button" className="btn-close" onClick={()=>setBill(null)} />
            </div>
            <div className="list-group-item d-flex align-items-center gap-2">
              <button type="button" className="btn btn-outline-primary">
                Monthly Payables: {remainingMonthly.toLocaleString('en-PK')} PKR
              </button>
            </div>
          </div>
          <h5 className="mt-3">Amount</h5>
          <input type="number" value={amount} onChange={(e)=>setAmount(Number(e.target.value||0))} className="form-control" placeholder="Amount to pay" disabled={(String(me?.role||'').toLowerCase()==='manager' && (me?.editRole===false || me?.editRole==='false'))} />
          {exceeds && <div className="text-danger small mt-1">Amount exceeds monthly payables</div>}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-outline-success" onClick={onPay} disabled={paying || !bill?._id || exceeds || isZero || (me && me.role==='manager' && me.editRole===false)}>
              {paying && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
              {paying ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </>
      )}
      <ToastContainer/>
    </div>
  );
};

export default PayElectricityBill;


