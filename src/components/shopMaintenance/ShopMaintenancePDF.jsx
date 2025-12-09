import React, { useContext, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Resolution } from 'react-to-pdf';
import { usePDF } from 'react-to-pdf';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const ShopMaintenancePDF = () => {
  const { id } = useParams();
  const location = useLocation();
  const { getShopMaintenanceById, getShopById, getUserById, getCustomHeaderRecords, getMaintenance, getShopMaintenance, getLoans } = useContext(AppContext);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outstanding, setOutstanding] = useState(null);
  const { toPDF, targetRef } = usePDF({ filename: 'ShopMaintenance.pdf', resolution: Resolution.HIGH });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getShopMaintenanceById(id);
      let enriched = data || null;
      try{
        if (enriched) {
          // Ensure shop object
          const shopRef = enriched.shop?._id || enriched.shop;
          if (shopRef && typeof shopRef === 'string' && !enriched.shop?.shopNumber) {
            const shopObj = await getShopById(shopRef);
            if (shopObj && shopObj._id) enriched.shop = shopObj;
          }
          // Ensure user object
          const fromRef = enriched.from?._id || enriched.from;
          if (fromRef && typeof fromRef === 'string' && !enriched.from?.userName) {
            const userObj = await getUserById(fromRef);
            if (userObj && userObj._id) enriched.from = { userName: userObj.userName, userMobile: userObj.userMobile, _id: userObj._id };
          }
        }
      }catch{}
      setRec(enriched);
      try{
        const userId = enriched?.from?._id || enriched?.fromUser?._id;
        if (userId){
          const [inChr, maintList, shopMaintList, pendingLoans] = await Promise.all([
            getCustomHeaderRecords ? getCustomHeaderRecords({ headerType: 'Incoming', recurring: true }) : Promise.resolve([]),
            getMaintenance ? getMaintenance({}) : Promise.resolve([]),
            getShopMaintenance ? getShopMaintenance({}) : Promise.resolve([]),
            getLoans ? getLoans({ status: 'Pending' }) : Promise.resolve([]),
          ]);
          const sumDueMonths = (list, by) => (list || [])
            .filter(r => (by(r) === userId) && Array.isArray(r.month))
            .reduce((acc, r) => acc + r.month.filter(m => m?.status === 'Due').reduce((s, m) => s + Number(m.amount || 0), 0), 0);
          const chrDue = sumDueMonths(inChr, r => r.fromUser?._id);
          const mDue   = sumDueMonths(maintList, r => r.from?._id);
          const smDue  = sumDueMonths(shopMaintList, r => r.from?._id);
          const loanPending = (pendingLoans || []).reduce((a,l)=> a + ((l.to?._id === userId || l.to === userId) && l.status==='Pending' ? Number(l.amount||0) : 0), 0);
          setOutstanding(chrDue + mDue + smDue + loanPending);
        } else {
          setOutstanding(null);
        }
      }catch{
        setOutstanding(null);
      }
      setLoading(false);
    })();
  }, [id, getShopMaintenanceById, getCustomHeaderRecords, getMaintenance, getShopMaintenance, getLoans]);

  const params = new URLSearchParams(location.search);
  const monthIndexParam = params.get('monthIndex');

  if (loading || !rec) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  let viewMonths = Array.isArray(rec.month) ? [...rec.month] : [];
  if (monthIndexParam !== null) {
    const idx = parseInt(monthIndexParam, 10);
    if (!isNaN(idx) && idx >= 0 && idx < viewMonths.length) viewMonths = [viewMonths[idx]];
  }
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
          <p style={{ fontSize: "13px" }} className="mb-1"><strong>Date:</strong> {rec?.createdAt ? new Date(rec.createdAt).toLocaleDateString() : ""}</p>
        </div>
        <div className="row mb-2 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold">Shop Maintenance</h5>
            <p><strong>Amount:</strong> {Number(rec.maintenanceAmount || 0).toLocaleString('en-PK')} PKR</p>
            <p><strong>Shop:</strong> {rec.shop?.shopNumber}</p>
            {(() => {
              const owner = rec.shop?.owner;
              const tenant = rec.shop?.tenant;
              return (
                <>
                  {owner ? <p><strong>Owner:</strong> {owner.userName}{owner.userMobile ? ` (${owner.userMobile})` : ''}</p> : null}
                  {tenant ? <p><strong>Tenant:</strong> {tenant.userName}{tenant.userMobile ? ` (${tenant.userMobile})` : ''}</p> : null}
                </>
              );
            })()}
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
                    <td>{m.occuranceDate ? fmtUTC(m.occuranceDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default ShopMaintenancePDF;


