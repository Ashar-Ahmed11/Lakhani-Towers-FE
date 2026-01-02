import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const BalanceSheetPDF = () => {
  const { getReceipts } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const { toPDF, targetRef } = usePDF({ filename: 'Balance-Sheet.pdf', resolution: Resolution.HIGH });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fromStr = params.get('from') || '';
  // Derive previous month range from provided 'from' (or today if absent) — memoize to keep stable deps
  const { prevStartISO, prevEndISO, prevStartDate, prevEndDate } = React.useMemo(() => {
    const base = fromStr ? new Date(fromStr) : new Date();
    const start = new Date(base.getFullYear(), base.getMonth() - 1, 1, 0, 0, 0, 0);
    const end = new Date(base.getFullYear(), base.getMonth(), 0, 23, 59, 59, 999);
    return {
      prevStartISO: start.toISOString(),
      prevEndISO: end.toISOString(),
      prevStartDate: start,
      prevEndDate: end,
    };
  }, [fromStr]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getReceipts({
        from: prevStartISO,
        to: prevEndISO,
      });
      setReceipts(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, [getReceipts, prevStartISO, prevEndISO]);

  const fmt = (n) => Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 });

  const totals = useMemo(() => {
    let flatRecv = 0, shopRecv = 0, eventsRecv = 0;
    let salaryPaid = 0, elecPaid = 0, miscPaid = 0;
    for (const r of receipts) {
      const t = r?.type;
      const m = r?.receiptModel;
      const amt = Number(r?.amount || 0);
      if (t === 'Recieved') {
        if (m === 'Flat') flatRecv += amt;
        else if (m === 'Shop') shopRecv += amt;
        else if (m === 'Events') eventsRecv += amt;
      } else if (t === 'Paid') {
        if (m === 'Salary') salaryPaid += amt;
        else if (m === 'ElectricityBill') elecPaid += amt;
        else if (m === 'MiscellaneousExpense') miscPaid += amt;
      }
    }
    const incomingTotal = flatRecv + shopRecv + eventsRecv;
    const expenseTotal = salaryPaid + elecPaid + miscPaid;
    const net = incomingTotal - expenseTotal;
    return { flatRecv, shopRecv, eventsRecv, incomingTotal, salaryPaid, elecPaid, miscPaid, expenseTotal, net };
  }, [receipts]);

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const pretty = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  return (
    <HelmetProvider>
      <Helmet><meta name="viewport" content="width=1024" /></Helmet>
      <div className="container text-center">
        <button className="btn btn-outline-primary my-4" onClick={() => toPDF()}>Download PDF</button>
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
        <div className="d-flex justify-content-between px-1">
          <p style={{ fontSize: "13px" }} className="mb-1">
            <strong>Range (Previous Month):</strong> {pretty(prevStartDate)} to {pretty(prevEndDate)}
          </p>
          <p style={{ fontSize: "13px" }} className="mb-1"><strong>Printed:</strong> {new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <div className="row mb-3 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold mb-0 text-center">Balance Sheet</h5>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="card border-0">
              <div className="card-body">
                <h6 className="fw-bold mb-2">Incoming</h6>
                <table className="table table-bordered">
                  <tbody>
                    <tr><td>Flat Receivings</td><td className="text-end">{fmt(totals.flatRecv)}</td></tr>
                    <tr><td>Shop Receivings</td><td className="text-end">{fmt(totals.shopRecv)}</td></tr>
                    <tr><td>Events Receivings</td><td className="text-end">{fmt(totals.eventsRecv)}</td></tr>
                    <tr className="table-light">
                      <td className="fw-bold">Total Incoming</td>
                      <td className="text-end fw-bold">{fmt(totals.incomingTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0">
              <div className="card-body">
                <h6 className="fw-bold mb-2">Expenses</h6>
                <table className="table table-bordered">
                  <tbody>
                    <tr><td>Salary</td><td className="text-end">{fmt(totals.salaryPaid)}</td></tr>
                    <tr><td>KE Electricity Bills</td><td className="text-end">{fmt(totals.elecPaid)}</td></tr>
                    <tr><td>Miscellaneous</td><td className="text-end">{fmt(totals.miscPaid)}</td></tr>
                    <tr className="table-light">
                      <td className="fw-bold">Total Expenses</td>
                      <td className="text-end fw-bold">{fmt(totals.expenseTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <table className="table table-bordered">
            <tbody>
              <tr className="table-secondary">
                <td className="fw-bold">Net Balance</td>
                <td className="text-end fw-bold">{fmt(totals.net)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default BalanceSheetPDF;


