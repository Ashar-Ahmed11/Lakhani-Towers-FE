import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CustomHeaderPage = () => {
  const { customHeaders, getCustomHeaderRecords } = useContext(AppContext);
  const { id } = useParams();
  const header = customHeaders.find(h => h._id === id);

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await getCustomHeaderRecords();
      setRecords((list || []).filter(r => r.header === id || r.header?._id === id));
      setLoading(false);
    })();
  }, [id, getCustomHeaderRecords]);

  const filtered = useMemo(() => {
    if (!q) return records;
    return (records || []).filter(r => String(r.amount || '').includes(q));
  }, [q, records]);

  if (!header) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-6">{header.headerName}</h1>
      <p className="text-muted">Type: {header.headerType} | Recurring: {header.recurring ? 'Yes' : 'No'}</p>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <form onSubmit={(e)=>e.preventDefault()} className="flex-grow-1 me-3">
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control" placeholder="Search by amount..." />
        </form>
        <a href={`/dashboard/custom-headers/${id}/create-record`} className="btn btn-outline-primary">Create Record</a>
      </div>

      <h4 className="mt-4">Records</h4>
      <div className="row g-3">
        {filtered.map(r => (
          <div key={r._id} className="col-12">
            <div className="card border-0 shadow-sm p-2">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold">Amount: {r.amount}</div>
                  <div className="text-muted small">On: {new Date(r.dateOfAddition).toLocaleDateString()}</div>
                </div>
                <div>
                  <a className="btn btn-sm btn-outline-dark" href={`/dashboard/custom-headers/${id}/edit-record/${r._id}`}>Edit</a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default CustomHeaderPage;


