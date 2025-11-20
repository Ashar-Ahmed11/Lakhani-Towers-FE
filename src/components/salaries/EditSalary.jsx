import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const EditSalary = () => {
  const { id } = useParams();
  const history = useHistory();
  const { getSalaryById, updateSalary, deleteSalary, uploadImage } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [employee, setEmployee] = useState(null);
  const [amount, setAmount] = useState('');
  const [dateOfCreation, setDateOfCreation] = useState(new Date());
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const [month, setMonth] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getSalaryById(id);
      setEmployee(data.employee || null);
      setAmount(data.amount || '');
      setDateOfCreation(data.dateOfCreation ? new Date(data.dateOfCreation) : new Date());
      setDocumentImages((data.documentImages || []).map(x => x.url));
      setMonth((data.month || []).map(m => ({ status: m.status || 'Pending', amount: m.amount || 0, occuranceDate: new Date(m.occuranceDate || new Date()) })));
      setLoading(false);
    })();
  }, [id, getSalaryById]);

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try{
      setSaving(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev=>[...prev, ...urls]);
    }catch{
      toast.error('Upload failed');
    }finally{
      setSaving(false);
    }
  };

  const addMonth = () => setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }]);
  const removeMonth = (i) => setMonth(month.filter((_,idx)=>idx!==i));

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setSaving(true);
      const payload = {
        employee: employee?._id,
        documentImages: documentImages.map(url => ({ url })),
        amount: Number(amount || 0),
        dateOfCreation,
        month: month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate })),
      };
      const updated = await updateSalary(id, payload);
      toast.success('Salary updated');
    }catch(err){
      toast.error(err?.message || 'Update failed');
    }finally{
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this salary?')) return;
    try{
      setDeleting(true);
      await deleteSalary(id);
      toast.success('Salary deleted');
      history.push('/dashboard/salaries');
    }catch(err){
      toast.error(err?.message || 'Delete failed');
    }finally{
      setDeleting(false);
    }
  };

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-6">Edit Salary</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Employee</h5>
        <div className="list-group my-2">
          <div className="list-group-item active d-flex justify-content-between align-items-center">
            <span>{employee?.employeeName} ({employee?.employeePhone})</span>
          </div>
        </div>

        <h5 className="mt-3">Amount</h5>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="form-control" placeholder="Amount" />

        <h5 className="mt-3">Date Of Creation</h5>
        <DatePicker dateFormat="dd/MM/yyyy" className='form-control' selected={dateOfCreation} onChange={(date) => setDateOfCreation(date)} />

        <h5 className="mt-3">Months</h5>
        <button type="button" className="btn btn-sm btn-outline-primary mb-2" onClick={addMonth}>+ Add Month</button>
            {month.map((m,i)=>(
          <div key={i} className="card rounded-3 my-2 p-2">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
              <div className="btn-group">
                <button
                  type="button"
                  className={`btn ${m.status==='Paid'?'btn-success':'btn-outline-success'}`}
                  onClick={()=>setMonth(month.map((x,idx)=>idx===i?{...x, status: x.status==='Paid'?'Pending':'Paid'}:x))}
                >Paid</button>
                <button
                  type="button"
                  className={`btn ${m.status==='Due'?'btn-danger':'btn-outline-secondary'} ms-2`}
                  onClick={()=>setMonth(month.map((x,idx)=>idx===i?{...x, status: x.status==='Due'?'Pending':'Due'}:x))}
                  disabled={m.status==='Paid'}
                >Due</button>
              </div>
              <input className="form-control w-auto" type="number" value={m.amount} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, amount:e.target.value}:x))} placeholder="Amount" />
              <DatePicker dateFormat="dd/MM/yyyy" className='form-control w-auto' selected={new Date(m.occuranceDate)} onChange={(date)=>setMonth(month.map((x,idx)=>idx===i?{...x, occuranceDate:date}:x))} />
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeMonth(i)}>×</button>
            </div>
          </div>
        ))}

        <h5 className="mt-3">Document Images</h5>
        <div className="input-group mb-3">
          <input onChange={uploadDocs} type="file" className="form-control" multiple />
          <label className="input-group-text">Upload</label>
          {saving && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {documentImages.map((url, idx)=>(
            <div
              key={idx}
              className="position-relative"
              draggable
              onDragStart={()=>setDragFrom(idx)}
              onDragEnter={()=>setDragTo(idx)}
              onDragEnd={()=>{
                if(dragFrom==null || dragTo==null || dragFrom===dragTo) return;
                const next = [...documentImages];
                const [moved] = next.splice(dragFrom,1);
                next.splice(dragTo,0,moved);
                setDocumentImages(next);
                setDragFrom(null); setDragTo(null);
              }}
            >
              <img src={url} alt="doc" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <span onClick={()=>setDocumentImages(documentImages.filter((_,i)=>i!==idx))} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button onClick={onDelete} type="button" disabled={deleting} className="btn btn-danger">{deleting ? <span className="spinner-border spinner-border-sm"></span> : 'Delete'}</button>
          <button disabled={saving} className="btn btn-outline-primary">{saving ? <span className="spinner-border spinner-border-sm"></span> : 'Save Changes'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default EditSalary;


