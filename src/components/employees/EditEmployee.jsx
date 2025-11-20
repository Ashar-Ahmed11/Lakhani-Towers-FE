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
  const { getEmployees, updateEmployee, deleteEmployee, uploadImage } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await getEmployees();
      const data = (list || []).find(x => x._id === id);
      setEmployee(data);
      setLoading(false);
    })();
  }, [id, getEmployees]);

  const onPhotoChange = async (e) => {
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

  const { employeeName, employeePhone, employeePhoto } = employee;

  return (
    <div className="container py-3">
      <h1 className="display-6">Edit Employee</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Employee Name</h5>
        <input value={employeeName || ''} onChange={(e)=>setEmployee({...employee, employeeName: e.target.value})} className="form-control" placeholder="Full Name" />

        <h5 className="mt-3">Employee Photo</h5>
        <div className="input-group mb-3">
          <input onChange={onPhotoChange} type="file" className="form-control" />
          <label className="input-group-text">Employee Image</label>
          {saving && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        {employeePhoto && (
          <div className="position-relative d-inline-block mb-2">
            <img src={employeePhoto} alt="Employee" style={{ maxWidth: 150, borderRadius: 8 }} />
            <span onClick={()=>setEmployee({...employee, employeePhoto: null})} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
          </div>
        )}

        <h5 className="mt-3">Employee Phone</h5>
        <input value={employeePhone || ''} onChange={(e)=>setEmployee({...employee, employeePhone: e.target.value})} className="form-control" placeholder="03xxxxxxxxx" />

        <div className="d-flex justify-content-between mt-3">
          <button onClick={onDelete} type="button" disabled={deleting} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditEmployee;


