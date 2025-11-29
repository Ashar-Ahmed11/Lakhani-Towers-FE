import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
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

const CustomHeaderListPDF = () => {
  const { id } = useParams();
  const location = useLocation();
  const { getCustomHeaderRecords, customHeaders } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const { toPDF, targetRef } = usePDF({ filename: 'HeaderRecords.pdf', resolution: Resolution.HIGH });

  const header = useMemo(() => (customHeaders || []).find(h => h._id === id), [customHeaders, id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || undefined;
      const to = params.get('to') || undefined;
      const status = params.get('status') || undefined;
      const headerType = params.get('headerType') || undefined;
      const recurring = params.get('recurring');
      const recFlag = typeof recurring === 'string' ? recurring === 'true' : undefined;
      const list = await getCustomHeaderRecords({
        headerType,
        from, to,
        ...(typeof recFlag !== 'undefined' ? { recurring: recFlag, status } : {})
      });
      const filtered = (list || []).filter(r => r.header === id || r.header?._id === id);
      setRecords(filtered.sort((a,b)=>new Date(b.dateOfAddition)-new Date(a.dateOfAddition)));
      setLoading(false);
    })();
  }, [location.search, id, getCustomHeaderRecords]);

  const pages = useMemo(() => chunk(records, 15), [records]);
  const getStatus = (months=[]) => {
    if (!Array.isArray(months) || months.length === 0) return '—';
    const hasDue = months.some(m => m?.status === 'Due');
    if (hasDue) return 'Due';
    const allPaid = months.every(m => m?.status === 'Paid');
    return allPaid ? 'Paid' : 'Pending';
  };

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
              <p style={{ fontSize: "13px" }}>{header?.headerName || 'Header Records'} - Page {pi+1}</p>
            </div>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {page.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1 + pi*15}</td>
                    <td>{r.purpose || ''}</td>
                    <td>{Number(r.amount || 0).toLocaleString('en-PK')} PKR</td>
                    <td>{getStatus(r.month)}</td>
                    <td>{r.dateOfAddition ? new Date(r.dateOfAddition).toLocaleDateString('en-GB') : ''}</td>
                  </tr>
                ))}
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

export default CustomHeaderListPDF;



