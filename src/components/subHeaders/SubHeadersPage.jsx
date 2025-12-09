import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';

const SubHeadersPage = () => {
  const { getSubHeaders } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const didInitRef = useRef(false);
  const history = useHistory();

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      setLoading(true);
      const res = await getSubHeaders();
      setList(Array.isArray(res) ? res : []);
      setLoading(false);
    })();
  }, [getSubHeaders]);

  const filtered = useMemo(() => {
    if (!q) return list;
    const qq = q.toLowerCase();
    return (list || []).filter(s => (s.subHeaderName || '').toLowerCase().includes(qq) || (s.header?.headerName || '').toLowerCase().includes(qq));
  }, [q, list]);

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="display-6">Sub Headers</h1>
        <Link to="/dashboard/create-sub-header" className="btn btn-outline-primary">Create</Link>
      </div>
      <input value={q} onChange={(e)=>setQ(e.target.value)} className="form-control mb-3" placeholder="Search by name or header..." />
      {loading ? (
        <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
      ) : (
        <div className="row g-3">
          {(filtered || []).map(s => (
            <div key={s._id} className="col-12">
              <div className="card border-0 shadow-sm p-2 d-flex flex-row align-items-center justify-content-between">
                <div>
                  <div className="fw-semibold">{s.subHeaderName}</div>
                  <div className="text-muted small">Header: {s.header?.headerName || '—'}</div>
                </div>
                <Link to={`/dashboard/edit-sub-header/${s._id}`} className="btn btn-outline-dark btn-sm">Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubHeadersPage;


