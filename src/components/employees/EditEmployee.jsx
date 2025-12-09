import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditEmployee = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getEmployees, updateEmployee, deleteEmployee, uploadImage, getAdminMe, getLoans, getSalaries } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [me, setMe] = useState(null);
  const [loans, setLoans] = useState([]);
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [list, meRes] = await Promise.all([getEmployees(), getAdminMe()]);
      const data = (list || []).find(x => x._id === id);
      setEmployee(data);
      setMe(meRes || null);
      try {
        const loanList = await getLoans({ toId: id });
        setLoans(Array.isArray(loanList) ? loanList : []);
        const salaryList = await getSalaries({ employeeId: id });
        setSalaries(Array.isArray(salaryList) ? salaryList : []);
      } catch { setLoans([]); setSalaries([]); }
      setLoading(false);
    })();
  }, [id, getEmployees, getAdminMe, getLoans, getSalaries]);

  const isAdmin = !!me && me.email === 'admin@lakhanitowers.com';
  const isManager = !!me && (typeof me?.editRole === 'boolean');
  const canEditGeneral = isAdmin || (isManager && me.editRole);
  const canSave = isAdmin || (isManager && me.editRole);
  const canDelete = isAdmin;

  const onPhotoChange = async (e) => {
    if (!canEditGeneral) return;
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const url = await uploadImage(file);
      setEmployee((prev)=>({ ...prev, employeePhoto: url }));
    } catch {
      toast.error('Image upload failed');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateEmployee(id, employee);
      toast.success('Employee updated');
      setEmployee(updated);
    } catch (err) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      setDeleting(true);
      await deleteEmployee(id);
      toast.success('Employee deleted');
      history.push('/dashboard/employees');
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !employee) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const { employeeName, employeePhone, employeePhoto, employeeCNIC, employeeVehicleNumber, drivingLicenseNumber } = employee;

  const CardRow = ({ title, items }) => (
    items.length > 0 ? (
      <div className="my-3">
        <h5 className="mb-2">{title}</h5>
        <div className="row g-3">
          {items.map((it, idx) => (
            <div key={idx} className="col-12">
              <div
                className="card border-0 shadow-sm p-2"
                style={{ cursor: 'pointer' }}
                onClick={()=>{
                  const url = (it.purpose === 'Salary')
                    ? `/dashboard/edit-salary/${it._id}`
                    : `/dashboard/edit-loan/${it._id}`;
                  window.open(url, '_blank');
                }}
              >
                <div className="d-flex align-items-center gap-3 flex-nowrap">
                  <div className="flex-grow-1">
                    {it.purpose ? <div className="text-muted small">Purpose: {it.purpose}</div> : null}
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-1">Amount: {Number(it.amount || 0).toLocaleString('en-PK')}</h6>
                    </div>
                    {it.status ? <div className="text-muted small">Status: {it.status}</div> : null}
                    {it.date ? <div className="text-muted small">On: {new Date(it.date).toLocaleDateString('en-GB')}</div> : null}
                  </div>
                  <div className="text-end" style={{ minWidth: '160px' }}>
                    <a
                      href={(it.purpose === 'Salary') ? `/dashboard/edit-salary/${it._id}` : `/dashboard/edit-loan/${it._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-dark btn-sm"
                      onClick={(ev)=>ev.stopPropagation()}
                    >Edit</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="container py-3">
      <h1 className="display-6">Edit Employee</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Employee Name</h5>
        <input disabled={!canEditGeneral} value={employeeName || ''} onChange={(e)=>setEmployee({...employee, employeeName: e.target.value})} className="form-control" placeholder="Full Name" />

        <h5 className="mt-3">Employee Photo</h5>
        <div className="input-group mb-3">
          <input disabled={!canEditGeneral} onChange={onPhotoChange} type="file" className="form-control" />
          <label className="input-group-text">Employee Image</label>
          {saving && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        {employeePhoto && (
          <div className="position-relative d-inline-block mb-2">
            <img src={employeePhoto} alt="Employee" style={{ maxWidth: 150, borderRadius: 8 }} />
            <span onClick={()=>{ if(!canEditGeneral) return; setEmployee({...employee, employeePhoto: null})}} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor: canEditGeneral ? 'pointer' : 'not-allowed', opacity: canEditGeneral ? 1 : .5 }} className="d-flex align-items-center justify-content-center">×</span>
          </div>
        )}

        <h5 className="mt-3">Employee Phone</h5>
        <input disabled={!canEditGeneral} value={employeePhone || ''} onChange={(e)=>setEmployee({...employee, employeePhone: e.target.value})} className="form-control" placeholder="03xxxxxxxxx" />

        <h5 className="mt-3">Employee CNIC</h5>
        <input disabled={!canEditGeneral} value={employeeCNIC || ''} onChange={(e)=>setEmployee({...employee, employeeCNIC: e.target.value})} className="form-control" placeholder="CNIC Number" />

        <h5 className="mt-3">Vehicle Number</h5>
        <input disabled={!canEditGeneral} value={employeeVehicleNumber || ''} onChange={(e)=>setEmployee({...employee, employeeVehicleNumber: e.target.value})} className="form-control" placeholder="e.g., ABC-1234" />

        <h5 className="mt-3">Driving License Number</h5>
        <input disabled={!canEditGeneral} value={drivingLicenseNumber || ''} onChange={(e)=>setEmployee({...employee, drivingLicenseNumber: e.target.value})} className="form-control" placeholder="DL Number" />

        <div className="d-flex justify-content-between mt-3">
          <button onClick={onDelete} type="button" disabled={deleting || !canDelete} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving || !canSave} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>
      <CardRow title="Incoming Records - Loans" items={(loans || [])} />
      <CardRow title="Expense Records - Salaries" items={(salaries || []).map(s=>({
        _id: s._id,
        purpose: 'Salary',
        amount: s.amount,
        status: (()=>{ const m = Array.isArray(s.month)?s.month:[]; const hasDue=m.some(x=>x?.status==='Due'); const allPaid=m.length>0 && m.every(x=>x?.status==='Paid'); return hasDue?'Due':(allPaid?'Paid':(m.length>0?'Pending':'—')); })(),
        date: s.dateOfCreation
      }))} />
      <ToastContainer/>
    </div>
  );
};

export default EditEmployee;


