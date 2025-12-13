import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateEmployee = () => {
  const { createEmployee, uploadImage, getAdminMe } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      const me = await getAdminMe();
      if (me && me.role === 'manager' && me.editRole === false) history.push('/dashboard');
      setMe(me || null);
    })();
  }, [getAdminMe, history]);
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeePhoto, setEmployeePhoto] = useState(null);
  const [employeeCNIC, setEmployeeCNIC] = useState('');
  const [employeeVehicleNumber, setEmployeeVehicleNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [me, setMe] = useState(null);
  const [dateOfJoining, setDateOfJoining] = useState(new Date());
  // Salary record
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [payablesAmt, setPayablesAmt] = useState(0);
  const [payablesFrom, setPayablesFrom] = useState(new Date());
  const [payablesTo, setPayablesTo] = useState(new Date());
  const [monthlyPayablesAmt, setMonthlyPayablesAmt] = useState(0);
  const [loanAmt, setLoanAmt] = useState(0);
  const [loanFrom, setLoanFrom] = useState(new Date());
  const [loanTo, setLoanTo] = useState(new Date());

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadImage(file);
      setEmployeePhoto(url);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        employeeName,
        employeePhone: Number(employeePhone || 0),
        employeePhoto,
        employeeCNIC,
        employeeVehicleNumber,
        drivingLicenseNumber,
        dateOfJoining,
        salaryRecord: {
          MonthlySalary: Number(monthlySalary || 0),
          Payables: { amount: Number(payablesAmt || 0), fromDate: payablesFrom, toDate: payablesTo },
          monthlyPayables: { amount: Number(monthlyPayablesAmt || 0) },
          loan: { amount: Number(loanAmt || 0), fromDate: loanFrom, toDate: loanTo },
        }
      };
      const created = await createEmployee(payload);
      if (created?._id) {
        toast.success('Record created');
        // reset form
        setEmployeeName('');
        setEmployeePhone('');
        setEmployeePhoto(null);
        setEmployeeCNIC('');
        setEmployeeVehicleNumber('');
        setDrivingLicenseNumber('');
        setDateOfJoining(new Date());
        setMonthlySalary(0);
        setPayablesAmt(0); setPayablesFrom(new Date()); setPayablesTo(new Date());
        setMonthlyPayablesAmt(0);
        setLoanAmt(0); setLoanFrom(new Date()); setLoanTo(new Date());
      } else throw new Error('Create failed');
    } catch (err) {
      toast.error(err?.message || 'Error creating employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-6">Create Employee</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Employee Name</h5>
        <input value={employeeName} onChange={(e)=>setEmployeeName(e.target.value)} className="form-control" placeholder="Full Name" />

        <h5 className="mt-3">Employee Photo</h5>
        <div className="input-group mb-3">
          <input onChange={onPhotoChange} type="file" className="form-control" />
          <label className="input-group-text">Employee Image</label>
          {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        {employeePhoto && (
          <div className="position-relative d-inline-block mb-2">
            <img src={employeePhoto} alt="Employee" style={{ maxWidth: 150, borderRadius: 8 }} />
            <span onClick={()=>setEmployeePhoto(null)} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
          </div>
        )}

        <h5 className="mt-3">Employee Phone</h5>
        <input value={employeePhone} onChange={(e)=>setEmployeePhone(e.target.value)} className="form-control" placeholder="03xxxxxxxxx" />

        <h5 className="mt-3">Employee CNIC</h5>
        <input value={employeeCNIC} onChange={(e)=>setEmployeeCNIC(e.target.value)} className="form-control" placeholder="CNIC Number" />

        <h5 className="mt-3">Vehicle Number</h5>
        <input value={employeeVehicleNumber} onChange={(e)=>setEmployeeVehicleNumber(e.target.value)} className="form-control" placeholder="e.g., ABC-1234" />

      <h5 className="mt-3">Driving License Number</h5>
      <input value={drivingLicenseNumber} onChange={(e)=>setDrivingLicenseNumber(e.target.value)} className="form-control" placeholder="DL Number" />

        <h5 className="mt-3">Date Of Joining</h5>
        <DatePicker dateFormat="dd/MM/yy" className='form-control' selected={dateOfJoining} onChange={(date) => setDateOfJoining(date)} />

        <h5 className="mt-4">Salary Record</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small">Monthly Salary</label>
            <input type="number" className="form-control" value={monthlySalary} onChange={(e)=>setMonthlySalary(Number(e.target.value||0))} />
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Payables</div>
          <div className="row g-2">
            <div className="col-md-3"><input type="number" className="form-control" placeholder="Amount" value={payablesAmt} onChange={(e)=>setPayablesAmt(Number(e.target.value||0))} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={payablesFrom} onChange={(date)=>setPayablesFrom(date)} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={payablesTo} onChange={(date)=>setPayablesTo(date)} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Monthly Payables</div>
          <div className="row g-2">
            <div className="col-md-3"><input type="number" className="form-control" placeholder="Amount" value={monthlyPayablesAmt} onChange={(e)=>setMonthlyPayablesAmt(Number(e.target.value||0))} /></div>
          </div>
        </div>
        <div className="mt-2">
          <div className="fw-bold small">Loan</div>
          <div className="row g-2">
            <div className="col-md-3"><input type="number" className="form-control" placeholder="Amount" value={loanAmt} onChange={(e)=>setLoanAmt(Number(e.target.value||0))} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={loanFrom} onChange={(date)=>setLoanFrom(date)} /></div>
            <div className="col-md-3"><DatePicker dateFormat="dd/MM/yy" className='form-control' selected={loanTo} onChange={(date)=>setLoanTo(date)} /></div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button disabled={loading || (me && (typeof me.editRole==='boolean') && me.editRole===false)} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Employee'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateEmployee;


