import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Resolution } from 'react-to-pdf';
import { usePDF } from 'react-to-pdf';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import AppContext from '../context/appContext';

const chunk = (arr, size) => {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
};

const AllExpensesPDF = () => {
  const { getCustomHeaderRecords, getSalaries } = useContext(AppContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const { toPDF, targetRef } = usePDF({ filename: 'AllExpenses.pdf', resolution: Resolution.HIGH });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || undefined;
      const to = params.get('to') || undefined;
      const recurringOnly = params.get('recurringOnly') === 'true';
      const status = params.get('status') || undefined;
      const chr = await getCustomHeaderRecords({ headerType: 'Expense', from, to, ...(recurringOnly ? { recurring: true, status } : { recurring: false }) });
      let list = [...(chr || [])];
      if (recurringOnly) {
        const sal = await getSalaries({ from, to, status });
        const mappedSal = (sal || []).map(s => ({
          _id: s._id,
          amount: Number(s.amount || 0),
          dateOfAddition: s.dateOfCreation || s.createdAt || new Date(),
          header: { headerName: 'Salaries', headerType: 'Expense' },
          purpose: s.purpose || 'Salary',
          toName: s.employee?.employeeName || ''
        }));
        list = [...list, ...mappedSal];
      }
      setRecords(list);
      setLoading(false);
    })();
  }, [location.search, getCustomHeaderRecords, getSalaries]);

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
              <h1 className="fw-bold h3 pt-2">Lakhani Towers</h1>
              <p>Garden East, Karach, Sindh, Pakistan</p>
              <p style={{ fontSize: "13px" }}>All Expenses - Page {pi+1}</p>
            </div>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Purpose</th>
                  <th>Header</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {page.map((r, i) => {
                  const toName = r.toUser?.userName || r.toName || '';
                  return (
                    <tr key={r._id}>
                      <td>{i + 1 + pi*15}</td>
                      <td>{r.purpose || ''}</td>
                      <td>{r.header?.headerName || 'Expense'}</td>
                      <td>{toName}</td>
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

export default AllExpensesPDF;


