import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Resolution } from 'react-to-pdf';
import { usePDF } from 'react-to-pdf';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const SalaryPDF = () => {
  const { id } = useParams();
  const location = useLocation();
  const { getSalaryPublic } = useContext(AppContext);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);

  const { toPDF, targetRef } = usePDF({ filename: 'Salary.pdf', resolution: Resolution.HIGH });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getSalaryPublic(id);
      setRec(data || null);
      setLoading(false);
    })();
  }, [id, getSalaryPublic]);

  const params = new URLSearchParams(location.search);
  const monthIndexParam = params.get('monthIndex');

  if (loading || !rec) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  let viewMonths = Array.isArray(rec.month) ? [...rec.month] : [];
  if (monthIndexParam !== null) {
    const idx = parseInt(monthIndexParam, 10);
    if (!isNaN(idx) && idx >= 0 && idx < viewMonths.length) viewMonths = [viewMonths[idx]];
  }

  const getStatus = (months=[]) => {
    if (!Array.isArray(months) || months.length === 0) return null;
    const hasDue = months.some(m => m?.status === 'Due');
    if (hasDue) return 'Due';
    const allPaid = months.every(m => m?.status === 'Paid');
    return allPaid ? 'Paid' : 'Pending';
  };

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>

      <div className="container text-center">
        <button className="btn btn-outline-primary my-4" onClick={() => toPDF()}>Download PDF</button>
      </div>

      <div ref={targetRef} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px" }} className="shadow-lg rounded">
        <div className="text-center mb-2">
          <img src={logo} alt="Lakhani Towers" style={{ height: 100 }} />
          <p>Garden East, Karach, Sindh, Pakistan</p>
          <p style={{ fontSize: "13px" }}>Ph: 0312-9071455, 0330-6033470</p>
        </div>

        <div className="d-flex justify-content-end px-1">
          <p style={{ fontSize: "13px" }} className="mb-1"><strong>Date:</strong> {rec?.dateOfCreation ? new Date(rec.dateOfCreation).toLocaleDateString() : ""}</p>
        </div>

        <div className="row mb-2 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold">Salary</h5>
            <p><strong>Employee:</strong> {rec.employee?.employeeName} ({rec.employee?.employeePhone})</p>
            <p><strong>Amount:</strong> {Number(rec.amount || 0).toLocaleString('en-PK')} PKR</p>
            {Array.isArray(viewMonths) && viewMonths.length > 0 ? (<p><strong>Status:</strong> {getStatus(viewMonths)}</p>) : null}
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
      </div>
    </HelmetProvider>
  );
};

export default SalaryPDF;



