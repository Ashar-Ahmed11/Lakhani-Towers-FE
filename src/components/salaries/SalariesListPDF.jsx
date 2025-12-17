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

const SalariesListPDF = () => {
  const { getSalaries } = useContext(AppContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const { toPDF, targetRef } = usePDF({ filename: 'Salaries.pdf', resolution: Resolution.HIGH });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || undefined;
      const to = params.get('to') || undefined;
      const status = params.get('status') || undefined;
      const list = await getSalaries({ from, to, status });
      setRecords(list || []);
      setLoading(false);
    })();
  }, [location.search, getSalaries]);

  const pages = useMemo(() => chunk((records||[]).slice().reverse(), 15), [records]);

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
              <p style={{ fontSize: "13px" }}>Salaries - Page {pi+1}</p>
            </div>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {page.map((r, i) => {
                  const months = Array.isArray(r.month) ? r.month : [];
                  const hasDue = months.some(m => m?.status === 'Due');
                  const allPaid = months.length>0 && months.every(m => m?.status === 'Paid');
                  const eff = hasDue ? 'Due' : (allPaid ? 'Paid' : (months.length>0 ? 'Pending' : '—'));
                  return (
                    <tr key={r._id}>
                      <td>{i + 1 + pi*15}</td>
                      <td>{r.employee?.employeeName}</td>
                      <td>{Number(r.amount || 0).toLocaleString('en-PK')} PKR</td>
                      <td>{eff}</td>
                      <td>{r.dateOfCreation ? new Date(r.dateOfCreation).toLocaleDateString('en-GB') : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4">
              <div className="row text-center">
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                  <div style={{ height: 60 }} />
                  <div style={{ borderTop: '1px solid #000', width: '100%', maxWidth: 160 }} />
                  <div className="mt-1 fw-semibold" style={{ fontSize: '13px' }}>Nadeem Khwaja</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Chairman</div>
                </div>
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                  <div style={{ height: 60 }} />
                  <div style={{ borderTop: '1px solid #000', width: '100%', maxWidth: 160 }} />
                  <div className="mt-1 fw-semibold" style={{ fontSize: '13px' }}>Zulfiqar Ali</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Accountant</div>
                </div>
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                  <div style={{ height: 60 }} />
                  <div style={{ borderTop: '1px solid #000', width: '100%', maxWidth: 160 }} />
                  <div className="mt-1 fw-semibold" style={{ fontSize: '13px' }}>Zaheer Ali</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Secretary</div>
                </div>
                <div className="col-6 col-md-3 d-flex flex-column align-items-center">
                  <div style={{ height: 60 }} />
                  <div style={{ borderTop: '1px solid #000', width: '100%', maxWidth: 160 }} />
                  <div className="mt-1 fw-semibold" style={{ fontSize: '13px' }}>Hussain Andani</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Treasure</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </HelmetProvider>
  );
};

export default SalariesListPDF;


