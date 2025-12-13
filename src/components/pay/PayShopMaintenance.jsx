import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PayShopMaintenance = () => {
  const { getShops, updateShop, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [me, setMe] = useState(null);
  const [shops, setShops] = useState([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [shop, setShop] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'out' | 'other' | 'monthly'
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async()=>{
      setLoading(true);
      const m = await getAdminMe(); setMe(m || null);
      if (m && m.role === 'manager' && m.editRole === false){ history.push('/dashboard'); return; }
      setShops(await getShops() || []);
      setLoading(false);
    })();
  }, [getAdminMe, getShops, history]);

  const onSearch = (val) => {
    setQ(val);
    if (!val.trim()) return setResults([]);
    const s = val.toLowerCase();
    const list = (shops||[]).filter(sh=>{
      const o=sh.owner||{}, t=sh.tenant||{};
      return String(sh.shopNumber||'').toLowerCase().includes(s)
        || String(o.userName||'').toLowerCase().includes(s)
        || String(o.userMobile||'').includes(val)
        || String(t.userName||'').toLowerCase().includes(s)
        || String(t.userMobile||'').includes(val);
    }).slice(0,8);
    setResults(list);
  };

  const ref = useMemo(()=>({
    out: shop?.maintenanceRecord?.Outstandings?.amount || 0,
    other: shop?.maintenanceRecord?.OtherOutstandings?.amount || 0,
    monthly: shop?.maintenanceRecord?.monthlyOutstandings?.amount || 0,
    paid: shop?.maintenanceRecord?.paidAmount || 0,
  }), [shop]);

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
      if (!shop?._id) return toast.error('Select a shop first');
      if (!selectedType) return toast.error('Select which outstanding to pay');
      const pay = Number(amount||0);
      if (pay<=0) return toast.error('Enter valid amount');
      if (exceedsSelected) return toast.error('Amount exceeds selected outstanding');
      const mr = shop?.maintenanceRecord || {};
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
      const updated = await updateShop(shop._id, { maintenanceRecord: next });
      toast.success('Payment recorded');
      const params = new URLSearchParams();
      params.set('shopId', shop._id);
      params.set('type', selectedType);
      params.set('amount', String(pay));
      params.set('date', new Date().toISOString());
      history.push(`/pdf/pay-shop-maintenance?${params.toString()}`);
    }catch(err){
      toast.error(err?.message || 'Failed to record payment');
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Pay Shop Maintenance</h1>
      <div className="mt-3">
        {!shop && (
          <>
            <input value={q} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search shop (number, owner/tenant name or phone)..." />
            {q.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(s=>(
                  <li key={s._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setShop(s); setQ(''); setResults([]); }}>
                    {s.shopNumber} {s?.owner?.userName ? `- ${s.owner.userName}` : ''} {s?.owner?.userMobile ? `(${s.owner.userMobile})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {shop && (
          <div className="list-group my-2">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <span>Shop {shop.shopNumber}</span>
              <button type="button" className="btn-close" onClick={()=>setShop(null)} />
            </div>
            <div className="list-group-item">
              <div className="small text-muted">Monthly Shop Maintenance</div>
              <div className="fw-bold">{Number(shop?.maintenanceRecord?.MonthlyMaintenance||0).toLocaleString('en-PK')} PKR</div>
            </div>
          </div>
        )}
      </div>
      {shop && (
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
          <input type="number" value={amount} disabled={!selectedType} onChange={(e)=>setAmount(Number(e.target.value||0))} className="form-control" placeholder="Amount to pay" />
          {exceedsSelected && <div className="text-danger small mt-1">Amount exceeds selected outstanding</div>}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-outline-success" onClick={doPay} disabled={!selectedType || !shop?._id || exceedsSelected || isZero}>Pay</button>
          </div>
        </>
      )}
      <ToastContainer/>
    </div>
  );
};

export default PayShopMaintenance;


