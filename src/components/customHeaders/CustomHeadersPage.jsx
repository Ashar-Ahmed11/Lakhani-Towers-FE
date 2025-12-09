import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';

const CustomHeadersPage = () => {
  const { customHeaders, getCustomHeaders, getAdminMe } = useContext(AppContext);
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async ()=>{
      setMe(await getAdminMe());
      const data = await getCustomHeaders();
      setList(data || []);
      setFiltered(data || []);
    })();
  }, [getCustomHeaders, getAdminMe]);

  const filterBySearch = (e) => {
    e.preventDefault();
    if (!q) return setFiltered(list);
    const updated = (list || []).filter((item) =>
      item.headerName?.toLowerCase().includes(q.toLowerCase())
    );
    setFiltered(updated);
  };

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>Custom Headers</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <form onSubmit={filterBySearch}>
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e) => setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" />
                <div className="px-2">
                  <button style={{ cursor: 'pointer', border: 'none', backgroundColor: "#fafafa" }} className='fas fa-search fa-lg'></button>
                </div>
              </div>
            </form>
            <div>
              <Link
                to='/dashboard/create-custom-header'
                onClick={(e)=>{ if(me && (typeof me.editRole==='boolean') && me.editRole===false){ e.preventDefault(); } }}
              >
                <button
                  style={{ borderColor: "#F4B92D", color: '#F4B92D' }}
                  className="btn rounded-circle"
                  disabled={me && (typeof me.editRole==='boolean') && me.editRole===false}
                >
                  <i className="fas fa-plus "></i>
                </button>
              </Link>
            </div>
          </div>
          <div>
            <div className="row g-3">
              {(filtered || []).map((e) => (
                <div key={e._id} className="col-12">
                  <div
                    className="card border-0 shadow-sm p-2"
                    style={{ cursor: 'pointer' }}
                    onClick={()=> window.open(`/dashboard/edit-custom-header/${e._id}`, '_blank')}
                  >
                    <div className="d-flex align-items-center gap-3 flex-nowrap">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="mb-1">{e.headerName}</h6>
                        </div>
                        <div className="text-muted small">Type: {e.headerType} | Recurring: {e.recurring ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="text-end" style={{ minWidth: '190px' }}>
                        <Link to={`/dashboard/edit-custom-header/${e._id}`} target="_blank" rel="noreferrer" className="btn btn-outline-dark btn-sm me-2" onClick={(ev)=>ev.stopPropagation()}>Edit</Link>
                        <Link to={`/dashboard/custom-headers/${e._id}`} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm" onClick={(ev)=>ev.stopPropagation()}>Open</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default CustomHeadersPage;


