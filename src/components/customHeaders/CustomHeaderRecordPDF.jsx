import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Resolution } from 'react-to-pdf';
import { usePDF } from 'react-to-pdf';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppContext from '../context/appContext';

const CHRecordPDF = () => {
  const { id, recordId } = useParams();
  const location = useLocation();
  const { getCustomHeaderRecordPublic } = useContext(AppContext);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  const { toPDF, targetRef } = usePDF({
    filename: 'Record.pdf',
    resolution: Resolution.HIGH
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getCustomHeaderRecordPublic(recordId);
      setRec(data || null);
      setLoading(false);
    })();
  }, [recordId, getCustomHeaderRecordPublic]);

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
          <h1 className="fw-bold h3 pt-2">Lakhani Towers</h1>
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

        <div className="row mb-2 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold">{isExpense ? 'To User' : 'From User'}</h5>
            <p><strong>Name:</strong> {partyName}</p>
            <p><strong>Phone:</strong> {partyPhone}</p>
          </div>
        </div>

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
                    <td>{m.occuranceDate ? new Date(m.occuranceDate).toLocaleDateString('en-GB') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HelmetProvider>
  );
};

export default CHRecordPDF;


