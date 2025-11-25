import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Resolution } from 'react-to-pdf';
import { usePDF } from 'react-to-pdf';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const chunk = (arr, size) => {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
};

const MaintenanceListPDF = () => {
  const { getMaintenance } = useContext(AppContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const { toPDF, targetRef } = usePDF({ filename: 'Maintenance.pdf', resolution: Resolution.HIGH });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || undefined;
      const to = params.get('to') || undefined;
      const list = await getMaintenance({ from, to });
      setRecords(list || []);
      setLoading(false);
    })();
  }, [location.search, getMaintenance]);

  const pages = useMemo(() => chunk(records, 15), [records]);

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>
      <div className="container text-center">
        <button className="btn btn-outline-primary my-4" onClick={() => toPDF()}>Download PDF</button>
      </div>
      <div ref={targetRef}>
        {pages.map((page, pi) => (
          <div key={pi} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px", pageBreakAfter: 'always' }} className="shadow-lg rounded">
            <div className="text-center mb-2">
              <img src={logo} alt="Lakhani Towers" style={{ height: 100 }} />
              <p>Garden East, Karach, Sindh, Pakistan</p>
              <p style={{ fontSize: "13px" }}>Maintenance - Page {pi+1}</p>
            </div>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Purpose</th>
                  <th>Flat</th>
                  <th>From</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {page.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1 + pi*15}</td>
                    <td>{r.maintenancePurpose}</td>
                    <td>{r.flat?.flatNumber}</td>
                    <td>{r.from?.userName} ({r.from?.userMobile})</td>
                    <td>{Number(r.maintenanceAmount || 0).toLocaleString('en-PK')} PKR</td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </HelmetProvider>
  );
};

export default MaintenanceListPDF;


