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

const AllIncomingsPDF = () => {
  const { getCustomHeaderRecords, getMaintenance, getShopMaintenance, getLoans } = useContext(AppContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const { toPDF, targetRef } = usePDF({ filename: 'AllIncomings.pdf', resolution: Resolution.HIGH });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || undefined;
      const to = params.get('to') || undefined;
      const recurringOnly = params.get('recurringOnly') === 'true';
      const status = params.get('status') || undefined;
      const chr = await getCustomHeaderRecords({ headerType: 'Incoming', from, to, ...(recurringOnly ? { recurring: true, status } : { recurring: false }) });
      let mappedMaint = [];
      let mappedShopMaint = [];
      let mappedLoans = [];
      if (recurringOnly) {
        const maints = await getMaintenance({ from, to, status });
        const shopMaints = await getShopMaintenance({ from, to, status });
        const loans = await getLoans({ from, to, status });
        mappedMaint = (maints || []).map(m => ({
          _id: m._id,
          amount: Number(m.maintenanceAmount || 0),
          dateOfAddition: m.createdAt || m.updatedAt || new Date(),
          header: { headerName: 'Maintanance', headerType: 'Incoming' },
          purpose: m.maintenancePurpose,
          fromName: m.from?.userName || ''
        }));
        mappedShopMaint = (shopMaints || []).map(m => ({
          _id: m._id,
          amount: Number(m.maintenanceAmount || 0),
          dateOfAddition: m.createdAt || m.updatedAt || new Date(),
          header: { headerName: 'Shop Maintenance', headerType: 'Incoming' },
          purpose: m.maintenancePurpose,
          fromName: m.from?.userName || ''
        }));
        mappedLoans = (loans || []).map(l => ({
          _id: l._id,
          amount: Number(l.amount || 0),
          dateOfAddition: l.date || l.createdAt || new Date(),
          header: { headerName: 'Loan', headerType: 'Incoming' },
          purpose: l.purpose
        }));
      }
      setRecords([...(chr || []), ...mappedMaint, ...mappedShopMaint, ...mappedLoans].sort((a,b)=>new Date(b.dateOfAddition)-new Date(a.dateOfAddition)));
      setLoading(false);
    })();
  }, [location.search, getCustomHeaderRecords, getMaintenance, getShopMaintenance, getLoans]);

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
              <p style={{ fontSize: "13px" }}>All Incomings - Page {pi+1}</p>
            </div>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Purpose</th>
                  <th>Header</th>
                  <th>From</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {page.map((r, i) => {
                  const fromName = r.fromUser?.userName || r.fromName || '';
                  return (
                    <tr key={r._id}>
                      <td>{i + 1 + pi*15}</td>
                      <td>{r.purpose || ''}</td>
                      <td>{r.header?.headerName || 'Incoming'}</td>
                      <td>{fromName}</td>
                      <td>{Number(r.amount || 0).toLocaleString('en-PK')} PKR</td>
                      <td>{r.dateOfAddition ? new Date(r.dateOfAddition).toLocaleDateString('en-GB') : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </HelmetProvider>
  );
};

export default AllIncomingsPDF;


