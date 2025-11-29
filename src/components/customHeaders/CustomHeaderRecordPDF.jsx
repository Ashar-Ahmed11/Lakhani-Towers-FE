import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Resolution } from 'react-to-pdf';
import { usePDF } from 'react-to-pdf';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const CHRecordPDF = () => {
  const { id, recordId } = useParams();
  const location = useLocation();
  const { getCustomHeaderRecordPublic, getCustomHeaderRecords, getLoans } = useContext(AppContext);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outstanding, setOutstanding] = useState(null);

  const { toPDF, targetRef } = usePDF({
    filename: 'Record.pdf',
    resolution: Resolution.HIGH
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getCustomHeaderRecordPublic(recordId);
      setRec(data || null);
      // Compute outstanding for Incoming user: sum of Due month amounts across user's recurring incoming records
      try{
        const header = data?.header || {};
        const userId = data?.fromUser?._id;
        if (header.headerType === 'Incoming' && userId && getCustomHeaderRecords){
          const list = await getCustomHeaderRecords({ headerType: 'Incoming', recurring: true });
          const sumRecurringDue = (list || [])
            .filter(r => (r.fromUser?._id === userId) && Array.isArray(r.month))
            .reduce((acc, r) => acc + r.month
              .filter(m => m?.status === 'Due')
              .reduce((s, m) => s + Number(m.amount || 0), 0), 0);
          // Add user's pending loans
          let loanPending = 0;
          try{
            const loans = await getLoans({ status: 'Pending' });
            loanPending = (loans || []).reduce((a, l) => a + ((l.to?._id === userId || l.to === userId) && l.status === 'Pending' ? Number(l.amount||0) : 0), 0);
          }catch{}
          setOutstanding(sumRecurringDue + loanPending);
        } else {
          setOutstanding(null);
        }
      }catch{
        setOutstanding(null);
      }
      setLoading(false);
    })();
  }, [recordId, getCustomHeaderRecordPublic, getCustomHeaderRecords, getLoans]);

  const fmtUTC = (d) => {
    try { const s = new Date(d).toISOString().slice(0,10); const [y,m,da]=s.split('-'); return `${da}/${m}/${y}`; } catch { return '—'; }
  };
  const getStatus = (months=[]) => {
    if (!Array.isArray(months) || months.length === 0) return null;
    const hasDue = months.some(m => m?.status === 'Due');
    if (hasDue) return 'Due';
    const allPaid = months.every(m => m?.status === 'Paid');
    return allPaid ? 'Paid' : 'Pending';
  };

  if (loading || !rec) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const header = rec.header || {};
  const isExpense = header.headerType === 'Expense';
  const partyName = isExpense ? (rec.toUser?.userName || '') : (rec.fromUser?.userName || '');
  const partyPhone = isExpense ? (rec.toUser?.userMobile || '') : (rec.fromUser?.userMobile || '');
  const params = new URLSearchParams(location.search);
  const monthIndexParam = params.get('monthIndex');
  let viewMonths = Array.isArray(rec.month) ? [...rec.month] : [];
  if (monthIndexParam !== null) {
    const idx = parseInt(monthIndexParam, 10);
    if (!isNaN(idx) && idx >= 0 && idx < viewMonths.length) viewMonths = [viewMonths[idx]];
  }

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="viewport" content="width=1024" />
      </Helmet>

      <div className="container text-center">
        <button className="btn btn-outline-primary my-4" onClick={() => toPDF()}>
          Download PDF
        </button>
      </div>

      <div
        ref={targetRef}
        style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px" }}
        className="shadow-lg rounded"
      >
        <div className="text-center mb-2">
          <img src={logo} alt="Lakhani Towers" style={{ height: 100 }} />
          <p>Garden East, Karach, Sindh, Pakistan</p>
          <p style={{ fontSize: "13px" }}>Ph: 0312-9071455, 0330-6033470</p>
        </div>

        <div className="d-flex justify-content-end px-1">
          <p style={{ fontSize: "13px" }} className="mb-1">
            <strong>Date:</strong> {rec?.dateOfAddition ? new Date(rec.dateOfAddition).toLocaleDateString() : ""}
          </p>
        </div>

        <div className="row mb-2 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold">{header.headerName} ({header.headerType})</h5>
            {rec.purpose ? <p><strong>Purpose:</strong> {rec.purpose}</p> : null}
            <p><strong>Amount:</strong> {Number(rec.amount || 0).toLocaleString('en-PK')} PKR</p>
            {Array.isArray(viewMonths) && viewMonths.length > 0 ? (
              <p><strong>Status:</strong> {getStatus(viewMonths)}</p>
            ) : null}
          </div>
        </div>

        {/* Non-recurring single payment table */}
        {!header.recurring && (
          <div className="pt-2 pb-2">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>{Number(rec.amount || 0).toLocaleString('en-PK')} PKR</td>
                  <td>Paid</td>
                  <td>{rec.dateOfAddition ? new Date(rec.dateOfAddition).toLocaleDateString('en-GB') : ''}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="row mb-2 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold">{isExpense ? 'To User' : 'From User'}</h5>
            <p><strong>Name:</strong> {partyName}</p>
            <p><strong>Phone:</strong> {partyPhone}</p>
          </div>
        </div>

        {/* Outstanding balance card for incoming */}
        {!isExpense && outstanding !== null && (
          <div className="row mb-2 g-3">
            <div className="col-12 border p-2 rounded-3">
              <h5 className="fw-bold">User Outstanding Balance</h5>
              <p className="mb-0">{Number(outstanding).toLocaleString('en-PK')} PKR</p>
            </div>
          </div>
        )}

        {Array.isArray(viewMonths) && viewMonths.length > 0 && (
          <div className="pt-2 pb-2">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {viewMonths.map((m, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{Number(m.amount || 0).toLocaleString('en-PK')} PKR</td>
                    <td>{m.status}</td>
                    <td>{m.occuranceDate ? fmtUTC(m.occuranceDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Disclaimer */}
        <div className="mt-3" style={{ fontSize: '14px' }}>
          <p className="mb-1"><strong>Disclaimer:</strong></p>
          <ul className="mb-0">
            <li>All amounts are in PKR. Please retain this document for your records.</li>
            <li>Payments are subject to verification by administration.</li>
            <li>This is a system-generated document; signature is not required.</li>
            <li>Report any discrepancies within 7 days of issuance.</li>
            <li>Late payments may incur additional charges as per policy.</li>
            <li>For queries, contact the office numbers listed above.</li>
          </ul>
        </div>
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
    </HelmetProvider>
  );
};

export default CHRecordPDF;


