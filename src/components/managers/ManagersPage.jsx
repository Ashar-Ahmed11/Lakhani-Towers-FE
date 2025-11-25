import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';

const ManagersPage = () => {
  const { getManagers, getAdminMe } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMe(await getAdminMe());
      const data = await getManagers();
      setList(data || []);
      setFiltered(data || []);
      setLoading(false);
    })();
  }, [getManagers, getAdminMe]);

  const filterBySearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return setFiltered(list);
    const updated = (list || []).filter((m) =>
      (m.fullName || '').toLowerCase().includes(q.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(q.toLowerCase())
    );
    setFiltered(updated);
  };

  const canCreate = me?.email === 'admin@lakhanitowers.com';

  return (
    <div className="my-2">
      <div className="container-fluid ">
        <h1 className="display-4" style={{ fontWeight: 900 }}>Managers</h1>
        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <form onSubmit={filterBySearch}>
              <div className="d-flex align-items-center">
                <input value={q} onChange={(e) => setQ(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" placeholder="Search name/email" />
                <div className="px-2">
                  <button style={{ cursor: 'pointer', border: 'none', backgroundColor: "#fafafa" }} className='fas fa-search fa-lg'></button>
                </div>
              </div>
            </form>
            <div>
              {canCreate && <Link to='/dashboard/create-manager'> <button style={{ borderColor: "#F4B92D", color: '#F4B92D' }} className="btn rounded-circle"><i className="fas fa-plus "></i></button></Link>}
            </div>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(filtered || []).map((m) => (
                  <div key={m._id} className="col-12">
                    <div className="card border-0 shadow-sm p-2">
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="mb-1">{m.fullName}</h6>
                          </div>
                          <div className="text-muted small">{m.email}</div>
                        </div>
                        <div className="text-end" style={{ minWidth: '110px' }}>
                          <Link to={`/dashboard/edit-manager/${m._id}`} className="btn btn-outline-dark btn-sm">Edit</Link>
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
    </div >
  );
};

export default ManagersPage;


