import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PayMaintenance = () => {
  const { getFlats, getFlatById, updateFlat, getAdminMe, createReceipt } = useContext(AppContext);
  const history = useHistory();
  const [me, setMe] = useState(null);
  const [flats, setFlats] = useState([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [flat, setFlat] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'out', 'other', 'monthly'
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    (async()=>{
      setLoading(true);
      const m = await getAdminMe(); setMe(m || null);
      const bool = (v) => v === true || v === 'true' || v === 1 || v === '1';
      const role = String(m?.role||'').toLowerCase();
      const isAdmin = role === 'admin' || bool(m?.isAdmin);
      const isManager = role === 'manager' && !isAdmin;
      const allowed = isAdmin || bool(m?.payAllAmounts);
      if (!allowed){ history.replace('/dashboard'); return; }
      setFlats(await getFlats() || []);
      setLoading(false);
    })();
  }, [getAdminMe, getFlats, history]);

  const onSearch = (val) => {
    setQ(val);
    if (!val.trim()) return setResults([]);
    const s = val.toLowerCase();
    const list = (flats||[]).filter(f=>{
      const o=f.owner||{}, t=f.tenant||{};
      return String(f.flatNumber||'').toLowerCase().includes(s)
        || String(o.userName||'').toLowerCase().includes(s)
        || String(o.userMobile||'').includes(val)
        || String(t.userName||'').toLowerCase().includes(s)
        || String(t.userMobile||'').includes(val);
    }).slice(0,8);
    setResults(list);
  };

  const ref = useMemo(()=>({
    out: flat?.maintenanceRecord?.Outstandings?.amount || 0,
    other: flat?.maintenanceRecord?.OtherOutstandings?.amount || 0,
    monthly: flat?.maintenanceRecord?.monthlyOutstandings?.amount || 0,
    paid: flat?.maintenanceRecord?.paidAmount || 0,
  }), [flat]);

  const displayRemaining = (kind) => {
    const base = kind==='out' ? Number(ref.out||0) : kind==='other' ? Number(ref.other||0) : Number(ref.monthly||0);
    if (selectedType === kind) {
      const a = Number(amount || 0);
      return Math.max(0, base - a);
    }
    return base;
  };

  const setType = (t) => {
    setSelectedType(t);
    // Do not auto-fill amount from selected button; keep 0
    setAmount(0);
  };

  const baseForSelected = useMemo(()=>{
    if (!selectedType) return 0;
    if (selectedType==='out') return Number(ref.out||0);
    if (selectedType==='other') return Number(ref.other||0);
    if (selectedType==='monthly') return Number(ref.monthly||0);
    return 0;
  }, [selectedType, ref]);

  const exceedsSelected = Number(amount||0) > baseForSelected;
  const isZero = Number(amount||0) <= 0;

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const doPay = async () => {
    try{
      setPaying(true);
      if (!flat?._id) return toast.error('Select a flat first');
      if (!selectedType) return toast.error('Select which outstanding to pay');
      const pay = Number(amount||0);
      if (pay<=0) return toast.error('Enter valid amount');
      if (exceedsSelected) return toast.error('Amount exceeds selected outstanding');
      const current = await getFlatById(flat._id);
      const mr = current?.maintenanceRecord || {};
      const next = {...mr};
      if (selectedType==='out'){
        const cur = Number(mr?.Outstandings?.amount||0);
        next.Outstandings = { ...(mr.Outstandings||{}), amount: Math.max(0, cur - pay) };
      } else if (selectedType==='other'){
        const cur = Number(mr?.OtherOutstandings?.amount||0);
        next.OtherOutstandings = { ...(mr.OtherOutstandings||{}), amount: Math.max(0, cur - pay) };
      } else if (selectedType==='monthly'){
        const cur = Number(mr?.monthlyOutstandings?.amount||0);
        next.monthlyOutstandings = { amount: Math.max(0, cur - pay) };
      }
      next.paidAmount = Number(mr?.paidAmount||0) + pay;
      await updateFlat(flat._id, { maintenanceRecord: next });
      toast.success('Payment recorded');
      const params = new URLSearchParams();
      params.set('flatId', flat._id);
      params.set('type', selectedType);
      params.set('amount', String(pay));
      params.set('date', new Date().toISOString());
      const slug = `/pdf/pay-maintenance?${params.toString()}`;
      await createReceipt({
        receiptId: flat._id, receiptModel: 'Flat',
        type: 'Recieved', amount: Number(pay),
        receiptSlug: slug, dateOfCreation: new Date().toISOString()
      });
      try {
        const autoUrl = `${slug}${slug.includes('?') ? '&' : '?'}autoprint=1`;
        window.open(autoUrl, '_blank');
      } catch {
        history.push(slug);
      }
    }catch(err){
      toast.error(err?.message || 'Failed to record payment');
    } finally { setPaying(false); }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Pay Maintenance</h1>
      <div className="mt-3">
        {!flat && (
          <>
            <input value={q} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search flat (number, owner/tenant name or phone)..." />
            {q.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(f=>(
                  <li key={f._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setFlat(f); setQ(''); setResults([]); }}>
                    {f.flatNumber} {f?.owner?.userName ? `- ${f.owner.userName}` : ''} {f?.owner?.userMobile ? `(${f.owner.userMobile})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {flat && (
          <div className="list-group my-2">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <span>Flat {flat.flatNumber}</span>
              <button type="button" className="btn-close" onClick={()=>setFlat(null)} />
            </div>
            <div className="list-group-item">
              <div className="small text-muted">Monthly Maintenance</div>
              <div className="fw-bold">{Number(flat?.maintenanceRecord?.MonthlyMaintenance||0).toLocaleString('en-PK')} PKR</div>
            </div>
          </div>
        )}
      </div>
      {flat && (
        <>
          <h5 className="mt-3">Select Outstanding</h5>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className={`btn btn-${selectedType==='out'?'primary':'outline-primary'}`} onClick={()=>setType('out')}>
              Outstandings: {displayRemaining('out').toLocaleString('en-PK')} PKR
            </button>
            <button type="button" className={`btn btn-${selectedType==='other'?'primary':'outline-primary'}`} onClick={()=>setType('other')}>
              Other Outstandings: {displayRemaining('other').toLocaleString('en-PK')} PKR
            </button>
            <button type="button" className={`btn btn-${selectedType==='monthly'?'primary':'outline-primary'}`} onClick={()=>setType('monthly')}>
              Monthly Outstandings: {displayRemaining('monthly').toLocaleString('en-PK')} PKR
            </button>
          </div>
          <h5 className="mt-3">Amount</h5>
          <input type="number" value={amount} disabled={!selectedType || ((String(me?.role||'').toLowerCase()==='manager' && (me?.editRole===false || me?.editRole==='false')))} onChange={(e)=>setAmount(Number(e.target.value||0))} className="form-control" placeholder="Amount to pay" />
          {exceedsSelected && <div className="text-danger small mt-1">Amount exceeds selected outstanding</div>}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-outline-success" onClick={doPay} disabled={paying || !selectedType || !flat?._id || exceedsSelected || isZero}>
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

export default PayMaintenance;


