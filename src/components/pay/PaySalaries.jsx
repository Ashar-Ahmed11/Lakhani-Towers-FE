import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaySalaries = () => {
  const { getEmployees, updateEmployee, getAdminMe, createReceipt } = useContext(AppContext);
  const history = useHistory();
  const [me, setMe] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [emp, setEmp] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'payables' | 'monthly' | 'loan'
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
      const allowed = isAdmin || bool(m?.payAllAmounts) || bool(m?.salariesDistribution);
      if (!allowed){ history.replace('/dashboard'); return; }
      setEmployees(await getEmployees() || []);
      setLoading(false);
    })();
  }, [getAdminMe, getEmployees, history]);

  const onSearch = (val) => {
    setQ(val);
    if (!val.trim()) return setResults([]);
    const s = val.toLowerCase();
    const list = (employees||[]).filter(e=>{
      return String(e.employeeName||'').toLowerCase().includes(s)
        || String(e.employeePhone||'').includes(val)
        || String(e.employeeCNIC||'').includes(val);
    }).slice(0,8);
    setResults(list);
  };

  const ref = useMemo(()=>({
    payables: emp?.salaryRecord?.Payables?.amount || 0,
    monthly: emp?.salaryRecord?.monthlyPayables?.amount || 0,
    loan: emp?.salaryRecord?.loan?.amount || 0,
    paid: emp?.salaryRecord?.paidAmount || 0,
  }), [emp]);

  const displayRemaining = (kind) => {
    const base = kind==='payables' ? Number(ref.payables||0) : kind==='loan' ? Number(ref.loan||0) : Number(ref.monthly||0);
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
    if (selectedType==='payables') return Number(ref.payables||0);
    if (selectedType==='loan') return Number(ref.loan||0);
    if (selectedType==='monthly') return Number(ref.monthly||0);
    return 0;
  }, [selectedType, ref]);

  const exceedsSelected = Number(amount||0) > baseForSelected;
  const isZero = Number(amount||0) <= 0;

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const doPay = async () => {
    try{
      setPaying(true);
      if (!emp?._id) return toast.error('Select an employee first');
      if (!selectedType) return toast.error('Select which payable to pay');
      const pay = Number(amount||0);
      if (pay<=0) return toast.error('Enter valid amount');
      if (exceedsSelected) return toast.error('Amount exceeds selected payable');
      const sr = emp?.salaryRecord || {};
      const next = {...sr};
      if (selectedType==='payables'){
        const cur = Number(sr?.Payables?.amount||0);
        next.Payables = { ...(sr.Payables||{}), amount: Math.max(0, cur - pay) };
      } else if (selectedType==='loan'){
        const cur = Number(sr?.loan?.amount||0);
        const curPaid = Number(sr?.loan?.paidAmount||0);
        next.loan = { ...(sr.loan||{}), amount: Math.max(0, cur - pay), paidAmount: curPaid + pay };
      } else if (selectedType==='monthly'){
        const cur = Number(sr?.monthlyPayables?.amount||0);
        next.monthlyPayables = { amount: Math.max(0, cur - pay) };
      }
      next.paidAmount = Number(sr?.paidAmount||0) + pay;
      await updateEmployee(emp._id, { salaryRecord: next });
      toast.success('Payment recorded');
      const params = new URLSearchParams();
      params.set('employeeId', emp._id);
      params.set('employeeName', emp.employeeName || '');
      params.set('type', selectedType);
      params.set('amount', String(pay));
      params.set('date', new Date().toISOString());
      const slug = `/pdf/${'pay-salaries'}?${params.toString()}`;
      await createReceipt({
        receiptId: emp._id, receiptModel: 'Salary',
        type: (selectedType==='loan' ? 'Loan' : 'Paid'), amount: Number(pay),
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
      <h1 className="display-4" style={{ fontWeight: 900 }}>Pay Salaries</h1>
      <div className="mt-3">
        {!emp && (
          <>
            <input value={q} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search employee (name, phone, CNIC)..." />
            {q.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(e=>(
                  <li key={e._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setEmp(e); setQ(''); setResults([]); }}>
                    {e.employeeName} {e?.employeePhone ? `- (${e.employeePhone})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {emp && (
          <div className="list-group my-2">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <span>{emp.employeeName}</span>
              <button type="button" className="btn-close" onClick={()=>setEmp(null)} />
            </div>
            <div className="list-group-item">
              <div className="small text-muted">Monthly Salary</div>
              <div className="fw-bold">{Number(emp?.salaryRecord?.MonthlySalary||0).toLocaleString('en-PK')} PKR</div>
            </div>
          </div>
        )}
      </div>
      {emp && (
        <>
          <h5 className="mt-3">Select Payable</h5>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className={`btn btn-${selectedType==='payables'?'primary':'outline-primary'}`} onClick={()=>setType('payables')}>
              Payables: {displayRemaining('payables').toLocaleString('en-PK')} PKR
            </button>
            <button type="button" className={`btn btn-${selectedType==='monthly'?'primary':'outline-primary'}`} onClick={()=>setType('monthly')}>
              Monthly Payables: {displayRemaining('monthly').toLocaleString('en-PK')} PKR
            </button>
            <button type="button" className={`btn btn-${selectedType==='loan'?'primary':'outline-primary'}`} onClick={()=>setType('loan')}>
              Loan: {displayRemaining('loan').toLocaleString('en-PK')} PKR
            </button>
          </div>
          <h5 className="mt-3">Amount</h5>
          <input type="number" value={amount} disabled={!selectedType || ((String(me?.role||'').toLowerCase()==='manager' && (me?.editRole===false || me?.editRole==='false')))} onChange={(e)=>setAmount(Number(e.target.value||0))} className="form-control" placeholder="Amount to pay" />
          {exceedsSelected && <div className="text-danger small mt-1">Amount exceeds selected payable</div>}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-outline-success" onClick={doPay} disabled={paying || !selectedType || !emp?._id || exceedsSelected || isZero}>
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

export default PaySalaries;


