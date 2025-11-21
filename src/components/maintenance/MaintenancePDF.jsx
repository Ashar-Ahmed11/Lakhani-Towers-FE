import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { Resolution } from 'react-to-pdf';
import { usePDF } from 'react-to-pdf';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppContext from '../context/appContext';

const MaintenancePDF = () => {
  const { id } = useParams();
  const { getMaintenancePublic } = useContext(AppContext);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({ filename: 'Maintenance.pdf', resolution: Resolution.HIGH });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getMaintenancePublic(id);
      setRec(data || null);
      setLoading(false);
    })();
  }, [id, getMaintenancePublic]);

  if (loading || !rec) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>
      <div className="container text-center">
        <button className="btn btn-outline-primary my-4" onClick={() => toPDF()}>Download PDF</button>
      </div>
      <div ref={targetRef} style={{ maxWidth: "793px", minHeight: "1122px", margin: "0 auto", background: "#fff", color: "#000", padding: "20px" }} className="shadow-lg rounded">
        <div className="text-center mb-2">
          <h1 className="fw-bold h3 pt-2">Lakhani Towers</h1>
          <p>Garden East, Karach, Sindh, Pakistan</p>
          <p style={{ fontSize: "13px" }}>Ph: 0312-9071455, 0330-6033470</p>
        </div>
        <div className="d-flex justify-content-end px-1">
          <p style={{ fontSize: "13px" }} className="mb-1"><strong>Date:</strong> {rec?.createdAt ? new Date(rec.createdAt).toLocaleDateString() : ""}</p>
        </div>
        <div className="row mb-2 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold">Maintenance</h5>
            <p><strong>Purpose:</strong> {rec.maintenancePurpose}</p>
            <p><strong>Amount:</strong> {Number(rec.maintenanceAmount || 0).toLocaleString('en-PK')} PKR</p>
            <p><strong>Flat:</strong> {rec.flat?.flatNumber}</p>
            <p><strong>User:</strong> {rec.from?.userName} ({rec.from?.userMobile})</p>
          </div>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default MaintenancePDF;


