import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { usePDF, Resolution } from 'react-to-pdf';
import AppContext from '../context/appContext';
import logo from '../l1.png';

const DashboardPDF = () => {
  const { getCustomHeaderRecords, getSalaries, getMaintenance, getShopMaintenance, getLoans, getUsers, getEmployees, getFlats, getShops, getElectricityBills, getMiscExpenses, getEvents } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [incomingCHR, setIncomingCHR] = useState([]);
  const [expenseCHR, setExpenseCHR] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [shopMaintenance, setShopMaintenance] = useState([]);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [flats, setFlats] = useState([]);
  const [shops, setShops] = useState([]);

  const { toPDF, targetRef } = usePDF({ filename: 'Dashboard.pdf', resolution: Resolution.HIGH });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') || undefined;
  const to = params.get('to') || undefined;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [inChr, exChr, sal, maint, shopMaint, loanList, us, emps, fls, shps, bills, misc, events] = await Promise.all([
        getCustomHeaderRecords({ headerType: 'Incoming', from, to }),
        getCustomHeaderRecords({ headerType: 'Expense', from, to }),
        getSalaries({ from, to }),
        getMaintenance({ from, to }),
        getShopMaintenance({ from, to }),
        getLoans({ from, to }),
        getUsers(),
        getEmployees(),
        getFlats(),
        getShops(),
        getElectricityBills({ from, to }),
        getMiscExpenses({ from, to }),
        getEvents({ from, to })
      ]);
      setIncomingCHR(inChr || []);
      setExpenseCHR(exChr || []);
      setSalaries(sal || []);
      setMaintenance(maint || []);
      setShopMaintenance(shopMaint || []);
      setLoans(loanList || []);
      setUsers(us || []);
      setEmployees(emps || []);
      setFlats(fls || []);
      setShops(shps || []);
      setBills(bills || []);
      setMisc(misc || []);
      setEventsList(events || []);
      setLoading(false);
    })();
  }, [getCustomHeaderRecords, getSalaries, getMaintenance, getShopMaintenance, getLoans, getUsers, getEmployees, getFlats, getShops, getElectricityBills, getMiscExpenses, getEvents, from, to]);

  const fmt = (n) => Number(n || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 });

  const [bills, setBills] = useState([]);
  const [misc, setMisc] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  const totals = useMemo(() => {
    const paidValue = (m) => (m?.status === 'Paid' ? Number((m?.paidAmount && m.paidAmount > 0) ? m.paidAmount : (m?.amount || 0)) : 0);
    const paidFromMonths = (rec) => (rec?.month || []).reduce((s,m)=> s + paidValue(m), 0);
    const dueFromMonths = (rec) => (rec?.month || []).reduce((s,m)=> s + (m?.status==='Due' ? Number(m.amount||0) : 0), 0);
    const sumPaid = (months=[]) => (months || []).reduce((s,m)=> s + paidValue(m), 0);
    const sumDue  = (months=[]) => (months || []).reduce((s,m)=> s + (m?.status==='Due'  ? Number(m.amount||0) : 0), 0);
    const isRec = (r) => !!r?.header?.recurring;
    const oneOffPaid = (r) => {
      const months = Array.isArray(r?.month) ? r.month : [];
      return months.length > 0 ? sumPaid(months) : Number(r?.amount || 0);
    };

    const incomingPaid = (incomingCHR || []).reduce((a, r) => a + (isRec(r) ? paidFromMonths(r) : oneOffPaid(r)), 0);
    const incomingDue  = (incomingCHR || []).reduce((a, r) => a + (isRec(r) ? dueFromMonths(r) : 0), 0);

    const maintPaid        = (maintenance || []).reduce((a, m) => a + sumPaid(m.month), 0);
    const shopMaintPaid    = (shopMaintenance || []).reduce((a, m) => a + sumPaid(m.month), 0);
    const maintDue         = (maintenance || []).reduce((a, m) => a + sumDue(m.month), 0);
    const maintOutstandingDue = (maintenance || []).reduce((a, m) => a + ((m?.outstanding?.status === 'Due') ? Number(m.outstanding.amount || 0) : 0), 0);
    const shopMaintDue     = (shopMaintenance || []).reduce((a, m) => a + sumDue(m.month), 0);

    const loanPending      = (loans || []).reduce((a, l) => a + (l.status === 'Pending' ? Number(l.amount||0) : 0), 0);
    const loanPaid         = (loans || []).reduce((a, l) => a + (l.status === 'Paid'    ? Number(l.amount||0) : 0), 0);

    const salaryPaid   = (salaries || []).reduce((a, s) => a + paidFromMonths(s), 0);
    const chrExpPaid   = (expenseCHR || []).reduce((a, r) => a + (isRec(r) ? paidFromMonths(r) : oneOffPaid(r)), 0);
    const salaryDue    = (salaries || []).reduce((a, s) => a + dueFromMonths(s), 0);
    const chrExpDue    = (expenseCHR || []).reduce((a, r) => a + (isRec(r) ? dueFromMonths(r) : 0), 0);
    // Employee Payables (schema-level)
    const employeeMonthlyPayables = (employees || []).reduce((a,e)=> a + Number(e?.salaryRecord?.monthlyPayables?.amount || 0), 0);
    const employeePayables = (employees || []).reduce((a,e)=> a + Number(e?.salaryRecord?.Payables?.amount || 0), 0);
    const elecMonthlyPayables = (bills || []).reduce((a,b)=> a + Number(b?.BillRecord?.monthlyPayables?.amount || 0), 0);
    const miscOutstanding = (misc || []).reduce((a,m)=> a + Number(m?.amount || 0), 0);
    const expenseDue   = salaryDue + chrExpDue + employeeMonthlyPayables + employeePayables + elecMonthlyPayables + miscOutstanding;

    // Paid amounts captured on flat/shop schemas via Pay pages
    const flatsPaidAmount = (flats || []).reduce((a,f)=> a + Number(f?.maintenanceRecord?.paidAmount || 0), 0);
    const shopsPaidAmount = (shops || []).reduce((a,s)=> a + Number(s?.maintenanceRecord?.paidAmount || 0), 0);
    const flatsAdvanceAmount = (flats || []).reduce((a,f)=> a + Number(f?.maintenanceRecord?.AdvanceMaintenance?.amount || 0), 0);
    const shopsAdvanceAmount = (shops || []).reduce((a,s)=> a + Number(s?.maintenanceRecord?.AdvanceMaintenance?.amount || 0), 0);
    const elecPaid = (bills || []).reduce((a,b)=> a + Number(b?.BillRecord?.paidAmount || 0), 0);
    const miscPaid = (misc || []).reduce((a,m)=> a + Number(m?.paidAmount || 0), 0);
    const eventsPaid = (eventsList || []).reduce((a,e)=> a + Number(e?.paidAmount || 0), 0);
    const totalIncomingReceived = incomingPaid + maintPaid + shopMaintPaid + flatsPaidAmount + shopsPaidAmount + flatsAdvanceAmount + shopsAdvanceAmount + eventsPaid;
    const totalExpensePaid = salaryPaid + chrExpPaid + loanPaid + elecPaid + miscPaid;
    // Subtract remaining employee loan and only non-loan employee payments
    const employeeLoanAmtForBalance = (employees || []).reduce((a,e)=> a + Number(e?.salaryRecord?.loan?.amount || 0), 0);
    const employeesPaidAmount = (employees || []).reduce((a,e)=> a + Number(e?.salaryRecord?.paidAmount || 0), 0);
    const employeesLoanPaidAmount = (employees || []).reduce((a,e)=> a + Number(e?.salaryRecord?.loan?.paidAmount || 0), 0);
    const employeesNonLoanPaid = Math.max(0, employeesPaidAmount - employeesLoanPaidAmount);
    const currentBalance = totalIncomingReceived - totalExpensePaid - employeeLoanAmtForBalance - employeesNonLoanPaid;

    // Outstandings from flat/shop schemas
    const flatSchemaOut = (flats || []).reduce((a,f)=> {
      const mr = f?.maintenanceRecord || {};
      return a
        + Number(mr?.Outstandings?.amount || 0)
        + Number(mr?.OtherOutstandings?.amount || 0)
        + Number(mr?.monthlyOutstandings?.amount || 0);
    }, 0);
    const shopSchemaOut = (shops || []).reduce((a,s)=> {
      const mr = s?.maintenanceRecord || {};
      return a
        + Number(mr?.Outstandings?.amount || 0)
        + Number(mr?.OtherOutstandings?.amount || 0)
        + Number(mr?.monthlyOutstandings?.amount || 0);
    }, 0);
    // Employee loan included in Outstandings
    const employeeLoanAmt = (employees || []).reduce((a,e)=> a + Number(e?.salaryRecord?.loan?.amount || 0), 0);
    const eventsOutstanding = (eventsList || []).reduce((a,e)=> a + Number(e?.amount || 0), 0);
    const incomingOutstanding = incomingDue + maintDue + shopMaintDue + loanPending + maintOutstandingDue + flatSchemaOut + shopSchemaOut + employeeLoanAmt + eventsOutstanding;

    return {
      currentBalance,
      incomingDue: incomingOutstanding,
      totalIncomingReceived,
      maintPaid: maintPaid + shopMaintPaid,
      shopMaintPaid,
      expenseDue,
    };
  }, [incomingCHR, expenseCHR, salaries, maintenance, shopMaintenance, loans, flats, shops, employees, bills, misc, eventsList]);

  const entityCounts = useMemo(() => ({
    flats: Array.isArray(flats) ? flats.length : 0,
    employees: Array.isArray(employees) ? employees.length : 0,
    users: Array.isArray(users) ? users.length : 0,
    shops: Array.isArray(shops) ? shops.length : 0,
  }), [flats, employees, users, shops]);

  if (loading) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  const rows = [
    ['1', 'Current Balance', fmt(totals.currentBalance)],
    ['2', 'Outstandings', fmt(totals.incomingDue)],
    ['3', 'Payables', fmt(totals.expenseDue)],
    ['4', 'Total Amount Received', fmt(totals.totalIncomingReceived)],
    ['5', 'Paid Maintenance', fmt(totals.maintPaid)],
    ['6', 'Paid Shop Maintenance', fmt(totals.shopMaintPaid)],
    ['7', 'Total Flats', String(entityCounts.flats)],
    ['8', 'Total Shops', String(entityCounts.shops)],
    ['9', 'Total Employees', String(entityCounts.employees)],
    ['10', 'Total Users', String(entityCounts.users)],
  ];

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
            <strong>Range:</strong> {from ? new Date(from).toLocaleDateString('en-GB') : '—'} to {to ? new Date(to).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
          </p>
          <p style={{ fontSize: "13px" }} className="mb-1"><strong>Printed:</strong> {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="row mb-2 g-3">
          <div className="col-12 border p-2 rounded-3">
            <h5 className="fw-bold mb-0">Admin Dashboard Summary</h5>
          </div>
        </div>
        <div className="pt-2 pb-2">
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3" style={{ fontSize: '14px' }}>
          <p className="mb-1"><strong>Disclaimer:</strong></p>
          <ul className="mb-0">
            <li>All amounts are in PKR. Please retain this document for your records.</li>
            <li>This is a system-generated document; signatures are required.</li>
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

export default DashboardPDF;


