import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateMaintenance = () => {
  const { getFlats, createMaintenance, getAdminMe, uploadImage } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [month, setMonth] = useState([]);

  const [flats, setFlats] = useState([]);
  const [flat, setFlat] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);
  const [outstanding, setOutstanding] = useState({ amount: 0, status: 'Due', FromDate: new Date(), ToDate: new Date() });
  const [outLump, setOutLump] = useState('');

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('flat'); // flat only
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingData(true);
      const me = await getAdminMe(); if (me && me.role === 'manager' && me.editRole === false) return history.push('/dashboard');
      const fs = await getFlats(); setFlats(fs || []);
      const meRes = await getAdminMe(); setAdmin(meRes || null);
      setLoadingData(false);
    })();
  }, [getFlats, getAdminMe]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (flats || []).filter(f => f.flatNumber?.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
    setResults(filtered);
  };

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setLoading(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev => [...prev, ...urls]);
    } catch {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        maintenanceAmount,
        month: month.map(m => ({ status: m.status, amount: Number(m.amount || 0), occuranceDate: m.occuranceDate })),
        documentImages: documentImages.map(url => ({ url })),
        flat: flat?._id,
        to: admin?._id || null,
        outstanding: {
          amount: Number(outstanding.amount || 0),
          status: outstanding.status,
          FromDate: outstanding.FromDate,
          ToDate: outstanding.ToDate,
        },
      };
      const created = await createMaintenance(payload);
      if (created?._id) {
        toast.success('Record created');
        // reset form
        setMaintenanceAmount('');
        setMonth([]);
        setFlat(null);
        setDocumentImages([]);
        setSearch(''); setResults([]);
        setSearchType('flat');
        setOutstanding({ amount: 0, status: 'Due', FromDate: new Date(), ToDate: new Date() });
        setOutLump('');
      } else throw new Error('Create failed');
    } catch (err) {
      toast.error(err?.message || 'Error creating maintenance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Maintenance</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Maintenance Amount</h5>
        <input value={maintenanceAmount} onChange={(e) => setMaintenanceAmount(e.target.value)} className="form-control" placeholder="Amount" />

        <h5 className="mt-3">Flat</h5>
        {!flat && (
          loadingData ? (
            <div className="my-2 d-flex align-items-center gap-2">
              <span className="spinner-border spinner-border-sm"></span>
              <span>Loading flats...</span>
            </div>
          ) : (
            <>
              <input value={search} onChange={(e) => { onSearch(e.target.value) }} className="form-control" placeholder="Search flat..." />
              {searchType === 'flat' && search.trim() && results.length > 0 && (
                <ul className="list-group my-2">
                  {results.map(f => (
                    <li key={f._id} className="list-group-item" style={{ cursor: 'pointer' }} onClick={() => { setFlat(f); setSearch(''); setResults([]); }}>
                      Flat {f.flatNumber}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )
        )}
        {flat && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>
                Flat {flat.flatNumber}
                {(() => {
                  const active = flat.activeStatus || 'Owner';
                  const person = active === 'Tenant' ? flat.tenant : flat.owner;
                  return person ? <span className="ms-2 small">({active}: {person.userName} - {person.userMobile})</span> : <span className="ms-2 small">({active})</span>;
                })()}
              </span>
              <button type="button" className="btn-close" onClick={() => setFlat(null)} />
            </div>
          </div>
        )}



        <h5 className="mt-3">Document Images</h5>
        <div className="input-group mb-3">
          <input onChange={uploadDocs} type="file" className="form-control" multiple />
          <label className="input-group-text">Upload</label>
          {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {documentImages.map((url, idx) => (
            <div
              key={idx}
              className="position-relative"
              draggable
              onDragStart={() => setDragFrom(idx)}
              onDragEnter={() => setDragTo(idx)}
              onDragEnd={() => {
                if (dragFrom == null || dragTo == null || dragFrom === dragTo) return;
                const next = [...documentImages];
                const [moved] = next.splice(dragFrom, 1);
                next.splice(dragTo, 0, moved);
                setDocumentImages(next);
                setDragFrom(null); setDragTo(null);
              }}
            >
              <img src={url} alt="doc" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <span onClick={() => setDocumentImages(documentImages.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: -10, right: -10, background: '#000', width: 30, height: 30, border: '1px solid #F4B92D', color: '#F4B92D', borderRadius: '50%', cursor: 'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <h5 className="mt-3">Outstanding</h5>
        <div className="border border-1 rounded-3 p-2 ">
          <div className="row g-2 border-1">
            <div className="col-md-3">
              <input className="form-control" type="number" value={outstanding.amount} onChange={(e) => setOutstanding({ ...outstanding, amount: e.target.value })} placeholder="Outstanding amount" />
            </div>
            <div className="col-md-3">
              <div className="btn-group">
                <button type="button" className={`btn btn-${outstanding.status === 'Due' ? 'danger' : 'outline-danger'}`} onClick={() => setOutstanding({ ...outstanding, status: 'Due' })}>Due</button>
                <button type="button" className={`btn btn-${outstanding.status === 'Paid' ? 'success' : 'outline-success'} ms-2`} onClick={() => setOutstanding({ ...outstanding, status: 'Paid' })}>Paid</button>
              </div>
            </div>
            <div className="col-md-3">
              <input className="form-control" type="date" value={new Date(outstanding.FromDate).toISOString().slice(0, 10)} onChange={(e) => setOutstanding({ ...outstanding, FromDate: new Date(e.target.value) })} />
            </div>
            <div className="col-md-3">
              <input className="form-control" type="date" value={new Date(outstanding.ToDate).toISOString().slice(0, 10)} onChange={(e) => setOutstanding({ ...outstanding, ToDate: new Date(e.target.value) })} />
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 mt-2">
            <input className="form-control w-auto" type="number" value={outLump} onChange={(e) => setOutLump(e.target.value)} placeholder="Outstanding lumpsum" />
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                const v = Number(outLump || 0);
                const curr = Number(outstanding.amount || 0);
                if (v <= 0 || v >= curr) return;
                setOutstanding({ ...outstanding, amount: curr - v });
                setOutLump('');
              }}
              disabled={Number(outLump || 0) <= 0 || Number(outLump || 0) >= Number(outstanding.amount || 0)}
            >Lumpsum</button>
          </div>
        </div>

        <h5 className="mt-3">Months</h5>
        <button type="button" className="btn btn-sm btn-outline-primary mb-2" onClick={() => setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }])}>+ Add Month</button>
        {month.map((m, i) => (
          <div key={i} className="card rounded-3 my-2 p-2">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
              <div className="btn-group">
                <button
                  type="button"
                  className={`btn ${m.status === 'Paid' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setMonth(month.map((x, idx) => idx === i ? { ...x, status: x.status === 'Paid' ? 'Pending' : 'Paid' } : x))}
                >Paid</button>
                <button
                  type="button"
                  className={`btn ${m.status === 'Due' ? 'btn-danger' : 'btn-outline-secondary'} ms-2`}
                  onClick={() => setMonth(month.map((x, idx) => idx === i ? { ...x, status: x.status === 'Due' ? 'Pending' : 'Due' } : x))}
                  disabled={m.status === 'Paid'}
                >Due</button>
              </div>
              <input className="form-control w-auto" type="number" value={m.amount} onChange={(e) => setMonth(month.map((x, idx) => idx === i ? { ...x, amount: e.target.value } : x))} placeholder="Amount" />
              <input className="form-control w-auto" type="date" value={new Date(m.occuranceDate).toISOString().slice(0, 10)} onChange={(e) => setMonth(month.map((x, idx) => idx === i ? { ...x, occuranceDate: new Date(e.target.value) } : x))} />
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setMonth(month.filter((_, idx) => idx !== i))}>×</button>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-end mt-4">
          <button disabled={loading || loadingData || (admin && (typeof admin.editRole === 'boolean') && admin.editRole === false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Maintanance'}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateMaintenance;


