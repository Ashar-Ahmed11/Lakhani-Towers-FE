import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AppContext from '../context/appContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReceiptsPage = () => {
  const { 
    getReceipts, getAdminMe,
    // revert helpers
    getFlatById, updateFlat,
    getShopById, updateShop,
    getEmployeeById, updateEmployee,
    getElectricityBillById, updateElectricityBill,
    getMiscExpenseById, updateMiscExpense,
    getEventById, updateEvent,
    deleteReceipt
  } = useContext(AppContext);
  const history = useHistory();
  const location = useLocation();
  const [list, setList] = useState([]);
  const [me, setMe] = useState(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(location.search);
  const initialFrom = params.get('from') ? new Date(params.get('from')) : null;
  const initialTo = params.get('to') ? new Date(params.get('to')) : null;
  const initialStatus = params.get('status') || 'all'; // all | paid | received
  const [startDate, setStartDate] = useState(initialFrom);
  const [endDate, setEndDate] = useState(initialTo);
  const [status, setStatus] = useState(initialStatus);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
      const fmtLocalYMD = (d) => {
        if (!d) return undefined;
        const yy = d.getFullYear();
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        return `${yy}-${mm}-${dd}`;
      };
      const from = startDate ? fmtLocalYMD(startDate) : undefined;
      const to = endDate ? fmtLocalYMD(endDate) : undefined;
      const type = status === 'paid' ? 'Paid' : status === 'received' ? 'Recieved' : undefined;
      const data = await getReceipts({ from, to, type });
      setList(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [getReceipts, startDate, endDate, status, getAdminMe]);

  const rows = useMemo(() => {
    const s = String(q || '').toLowerCase();
    const filtered = (list || []).filter(r => {
      if (status === 'paid' && r.type !== 'Paid') return false;
      if (status === 'received' && r.type !== 'Recieved') return false;
      if (!s) return true;
      const serialRaw = r?.serialNumber ? String(r.serialNumber) : '';
      const serialPadded = r?.serialNumber ? String(r.serialNumber).padStart(5,'0') : '';
      return serialRaw.includes(s) || serialPadded.includes(s);
    });
    return filtered;
  }, [list, status, q]);

  const pushUrl = (next = {}) => {
    const p = new URLSearchParams(location.search);
    const fmtLocalYMD = (d) => {
      if (!d) return undefined;
      const yy = d.getFullYear();
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const dd = String(d.getDate()).padStart(2,'0');
      return `${yy}-${mm}-${dd}`;
    };
    if ('from' in next) { if (next.from) p.set('from', fmtLocalYMD(next.from)); else p.delete('from'); }
    if ('to' in next) { if (next.to) p.set('to', fmtLocalYMD(next.to)); else p.delete('to'); }
    if ('status' in next) { if (next.status) p.set('status', next.status); else p.delete('status'); }
    history.replace({ pathname: location.pathname, search: p.toString() });
  };

  const fmt = (n) => Number(n || 0).toLocaleString('en-PK');
  const d2 = (dt) => {
    if (!dt) return '-';
    const x = new Date(dt);
    const dd = String(x.getDate()).padStart(2, '0');
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    const yy = String(x.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };
  const d2t = (dt) => {
    if (!dt) return '-';
    const x = new Date(dt);
    const dd = String(x.getDate()).padStart(2, '0');
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    const yy = String(x.getFullYear()).slice(-2);
    let hh = x.getHours();
    const min = String(x.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12;
    if (hh === 0) hh = 12;
    const hhStr = String(hh).padStart(2, '0');
    return `${dd}/${mm}/${yy} ${hhStr}:${min} ${ampm}`;
  };
  
  const onPrint = (r) => {
    try {
      const hasQuery = String(r?.receiptSlug||'').includes('?');
      const url = `${r?.receiptSlug || ''}${hasQuery ? '&' : '?'}autoprint=1`;
      window.open(url, '_blank');
    } catch {
      window.open(r?.receiptSlug || '/', '_blank');
    }
  };

  const revertReceiptEffects = async (r) => {
    const amt = Number(r?.amount||0);
    const model = String(r?.receiptModel||'');
    const type = String(r?.type||''); // 'Paid' | 'Recieved'
    const id = (r?.receiptId && typeof r.receiptId === 'object') ? r.receiptId?._id : r?.receiptId;
    const qs = (()=>{ try { return new URLSearchParams(String(r?.receiptSlug||'').split('?')[1]||''); } catch { return new URLSearchParams(); } })();
    if (!id || !amt) return;
    if (model === 'Flat' && type === 'Recieved') {
      const t = qs.get('type'); // 'out' | 'other' | 'monthly'
      const flat = await getFlatById(id);
      const mr = flat?.maintenanceRecord || {};
      const next = { ...mr };
      if (t === 'out') {
        const cur = Number(mr?.Outstandings?.amount||0);
        next.Outstandings = { ...(mr.Outstandings||{}), amount: cur + amt };
      } else if (t === 'other') {
        const cur = Number(mr?.OtherOutstandings?.amount||0);
        next.OtherOutstandings = { ...(mr.OtherOutstandings||{}), amount: cur + amt };
      } else if (t === 'monthly') {
        const cur = Number(mr?.monthlyOutstandings?.amount||0);
        next.monthlyOutstandings = { amount: cur + amt };
      }
      next.paidAmount = Math.max(0, Number(mr?.paidAmount||0) - amt);
      await updateFlat(flat._id, { maintenanceRecord: next });
    } else if (model === 'Flat' && type === 'Advance') {
      const flat = await getFlatById(id);
      const mr = flat?.maintenanceRecord || {};
      const next = { ...mr };
      const curAdv = Number(mr?.AdvanceMaintenance?.amount || 0);
      next.AdvanceMaintenance = { amount: curAdv + amt };
      await updateFlat(flat._id, { maintenanceRecord: next });
    } else if (model === 'Shop' && type === 'Recieved') {
      const t = qs.get('type');
      const shop = await getShopById(id);
      const mr = shop?.maintenanceRecord || {};
      const next = { ...mr };
      if (t === 'out') {
        const cur = Number(mr?.Outstandings?.amount||0);
        next.Outstandings = { ...(mr.Outstandings||{}), amount: cur + amt };
      } else if (t === 'other') {
        const cur = Number(mr?.OtherOutstandings?.amount||0);
        next.OtherOutstandings = { ...(mr.OtherOutstandings||{}), amount: cur + amt };
      } else if (t === 'monthly') {
        const cur = Number(mr?.monthlyOutstandings?.amount||0);
        next.monthlyOutstandings = { amount: cur + amt };
      }
      next.paidAmount = Math.max(0, Number(mr?.paidAmount||0) - amt);
      await updateShop(shop._id, { maintenanceRecord: next });
    } else if (model === 'Shop' && type === 'Advance') {
      const shop = await getShopById(id);
      const mr = shop?.maintenanceRecord || {};
      const next = { ...mr };
      const curAdv = Number(mr?.AdvanceMaintenance?.amount || 0);
      next.AdvanceMaintenance = { amount: curAdv + amt };
      await updateShop(shop._id, { maintenanceRecord: next });
    } else if (model === 'Salary' && (type === 'Paid' || type === 'Loan')) {
      const t = qs.get('type'); // 'payables' | 'monthly' | 'loan'
      const emp = await getEmployeeById(id);
      const sr = emp?.salaryRecord || {};
      const next = { ...sr };
      if (t === 'payables') {
        const cur = Number(sr?.Payables?.amount||0);
        next.Payables = { ...(sr.Payables||{}), amount: cur + amt };
      } else if (t === 'monthly') {
        const cur = Number(sr?.monthlyPayables?.amount||0);
        next.monthlyPayables = { amount: cur + amt };
      } else if (t === 'loan') {
        const cur = Number(sr?.loan?.amount||0);
        const curPaid = Number(sr?.loan?.paidAmount||0);
        next.loan = { ...(sr.loan||{}), amount: cur + amt, paidAmount: Math.max(0, curPaid - amt) };
      }
      next.paidAmount = Math.max(0, Number(sr?.paidAmount||0) - amt);
      await updateEmployee(emp._id, { salaryRecord: next });
    } else if (model === 'ElectricityBill' && type === 'Paid') {
      const bill = await getElectricityBillById(id);
      const br = bill?.BillRecord || {};
      const curMonthly = Number(br?.monthlyPayables?.amount||0);
      const curPaid = Number(br?.paidAmount||0);
      await updateElectricityBill(bill._id, { 
        BillRecord: { 
          ...(br||{}), 
          monthlyPayables: { amount: curMonthly + amt }, 
          paidAmount: Math.max(0, curPaid - amt) 
        } 
      });
    } else if (model === 'MiscellaneousExpense' && type === 'Paid') {
      const item = await getMiscExpenseById(id);
      const curAmt = Number(item?.amount||0);
      const curPaid = Number(item?.paidAmount||0);
      await updateMiscExpense(item._id, { amount: curAmt + amt, paidAmount: Math.max(0, curPaid - amt) });
    } else if (model === 'Events' && type === 'Recieved') {
      const ev = await getEventById(id);
      const curAmt = Number(ev?.amount||0);
      const curPaid = Number(ev?.paidAmount||0);
      await updateEvent(ev._id, { amount: curAmt + amt, paidAmount: Math.max(0, curPaid - amt) });
    }
  };

  const confirmDelete = (r) => { setSelected(r); setConfirmOpen(true); };
  const handleDelete = async () => {
    if (!selected) return setConfirmOpen(false);
    try{
      setDeleting(true);
      await deleteReceipt(selected._id);
      await revertReceiptEffects(selected);
      setList((prev)=> (prev||[]).filter(x=>x._id !== selected._id));
      toast.success('Deleted successfully');
    } catch (e) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setSelected(null);
    }
  };

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>Receipts</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <form onSubmit={(e)=>{ e.preventDefault(); }}>
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e) => setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search serial number" />
                <div className="px-2">
                  <button style={{ cursor: 'pointer', border: 'none', backgroundColor: "#fafafa" }} className='fa fa-search fa-lg'></button>
                </div>
              </div>
            </form>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <DatePicker className="form-control" selected={startDate} onChange={(d)=>{ setStartDate(d); pushUrl({ from: d }); }} placeholderText="Start date" dateFormat="dd/MM/yy" maxDate={endDate || new Date()} />
            <DatePicker className="form-control" selected={endDate} onChange={(d)=>{ setEndDate(d); pushUrl({ to: d }); }} placeholderText="End date" dateFormat="dd/MM/yy" minDate={startDate} maxDate={new Date()} />
            <div className="btn-group" role="group" aria-label="status">
              <button type="button" className={`btn btn-${status==='all'?'primary':'outline-primary'}`} onClick={()=>{ setStatus('all'); pushUrl({ status: 'all' }); }}>All</button>
              <button type="button" className={`btn btn-${status==='paid'?'primary':'outline-primary'}`} onClick={()=>{ setStatus('paid'); pushUrl({ status: 'paid' }); }}>Paid</button>
              <button type="button" className={`btn btn-${status==='received'?'primary':'outline-primary'}`} onClick={()=>{ setStatus('received'); pushUrl({ status: 'received' }); }}>Received</button>
            </div>
            <button className="btn btn-outline-dark ms-auto" onClick={()=>{
              const qs = new URLSearchParams();
              const fmtLocalYMD = (d) => {
                const yy = d.getFullYear();
                const mm = String(d.getMonth()+1).padStart(2,'0');
                const dd = String(d.getDate()).padStart(2,'0');
                return `${yy}-${mm}-${dd}`;
              };
              if (startDate) qs.set('from', fmtLocalYMD(startDate));
              if (endDate) qs.set('to', fmtLocalYMD(endDate));
              if (status) qs.set('status', status);
              window.open(`/pdf/receipts${qs.toString() ? `?${qs.toString()}` : ''}`, '_blank');
            }}>Print</button>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(rows || []).map((r) => (
                  <div key={r._id} className="col-12">
                    <div
                      className="card border-0 shadow-sm p-2"
                      style={{ cursor: 'default' }}
                    >
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="mb-1">{r.receiptModel} — {r.type}</h6>
                          </div>
                          <div className="small text-muted">
                            Serial: {r?.serialNumber ? String(r.serialNumber).padStart(5,'0') : '-'}
                          </div>
                          <div className="small fw-bold">
                            <span style={{ color: r.type==='Paid' ? '#F4B92D' : '#198754' }}>
                              {fmt(r.amount)} PKR
                            </span>
                            {' '}| Date: {d2t(r.dateOfCreation || r.createdAt)}
                            {/* {' '}| Slug: {r.receiptSlug} */}
                          </div>
                          <div className="small text-muted">
                            {r.receiptModel==='Flat' ? (
                              <>Owner: {r?.receiptId?.owner?.userName || '-'} | Flat No: {r?.receiptId?.flatNumber || '-'}</>
                            ) : r.receiptModel==='Shop' ? (
                              <>Owner: {r?.receiptId?.owner?.userName || '-'} | Shop No: {r?.receiptId?.shopNumber || '-'}</>
                            ) : r.receiptModel==='ElectricityBill' ? (
                              <>Consumer: {r?.receiptId?.consumerNumber || '-'}</>
                            ) : r.receiptModel==='MiscellaneousExpense' ? (
                              <>Line Item: {r?.receiptId?.lineItem || '-'}</>
                            ) : r.receiptModel==='Salary' ? (
                              <>Employee: {r?.receiptId?.employee?.employeeName || (()=>{
                                try {
                                  const qs = new URLSearchParams(String(r?.receiptSlug||'').split('?')[1] || '');
                                  return qs.get('employeeName') || '-';
                                } catch { return '-'; }
                              })()}</>
                            ) : null}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={()=>onPrint(r)}>Print</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={()=>confirmDelete(r)} disabled={deleting}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer/>
      {confirmOpen && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" onClick={()=>setConfirmOpen(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this receipt?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setConfirmOpen(false)} disabled={deleting}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default ReceiptsPage;


