import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';

const CreateSubHeader = () => {
  const { getAdminMe, getCustomHeaders, createSubHeader } = useContext(AppContext);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subHeaderName, setSubHeaderName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [header, setHeader] = useState(null);
  const didInitRef = useRef(false);
  const history = useHistory();

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      const m = await getAdminMe();
      if (m && m.role === 'manager' && m.editRole === false) { history.push('/dashboard'); return; }
      setMe(m || null);
      const list = await getCustomHeaders();
      setHeaders(Array.isArray(list) ? list : []);
    })();
  }, [getAdminMe, getCustomHeaders, history]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (headers || []).filter(h => (h.headerName || '').toLowerCase().includes(q.toLowerCase())).slice(0, 7);
    setResults(filtered);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!header?._id || !subHeaderName.trim()) return;
    try{
      setLoading(true);
      const created = await createSubHeader({ subHeaderName: subHeaderName.trim(), header: header._id });
      if (created?._id) history.push('/dashboard/sub-headers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-6">Create Sub Header</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Sub Header Name</h5>
        <input value={subHeaderName} onChange={(e)=>setSubHeaderName(e.target.value)} className="form-control" placeholder="e.g., Generator Fuel" />
        <h5 className="mt-3">Header</h5>
        {!header && (
          <>
            <input value={search} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search header..." />
            {search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(h => (
                  <li key={h._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setHeader(h); setSearch(''); setResults([]); }}>
                    {h.headerName}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {header && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{header.headerName}</span>
              <button type="button" className="btn-close" onClick={()=>setHeader(null)} />
            </div>
          </div>
        )}
        <div className="d-flex justify-content-end mt-3">
          <button disabled={loading || (me && (typeof me.editRole==='boolean') && me.editRole===false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSubHeader;


