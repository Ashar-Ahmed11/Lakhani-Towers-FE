import React, { useContext, useEffect, useMemo, useState, useRef } from 'react'
import AppContext from './context/appContext'
import logo from './l1.png'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

const Home = () => {
    const { getCustomHeaderRecords, getSalaries, getMaintenance, getUsers, getEmployees, getFlats } = useContext(AppContext)
    const history = useHistory()
    const [loading, setLoading] = useState(true)
    const [incomingCHR, setIncomingCHR] = useState([])
    const [expenseCHR, setExpenseCHR] = useState([])
    const [salaries, setSalaries] = useState([])
    const [maintenance, setMaintenance] = useState([])
    const [users, setUsers] = useState([])
    const [employees, setEmployees] = useState([])
    const [flats, setFlats] = useState([])
    const didInitRef = useRef(false)

    useEffect(() => {
        if (didInitRef.current) return
        didInitRef.current = true
        ;(async () => {
            setLoading(true)
            const [inChr, exChr, sal, maint, us, emps, fls] = await Promise.all([
                getCustomHeaderRecords({ headerType: 'Incoming' }),
                getCustomHeaderRecords({ headerType: 'Expense' }),
                getSalaries({}),
                getMaintenance({}),
                getUsers(),
                getEmployees(),
                getFlats()
            ])
            setIncomingCHR(inChr || [])
            setExpenseCHR(exChr || [])
            setSalaries(sal || [])
            setMaintenance(maint || [])
            setUsers(us || [])
            setEmployees(emps || [])
            setFlats(fls || [])
            setLoading(false)
        })()
    }, [getCustomHeaderRecords, getSalaries, getMaintenance, getUsers, getEmployees, getFlats])

    const fmt = (n) => Number(n || 0).toLocaleString('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 })
    const count = (arr = [], status) => (Array.isArray(arr) ? arr.filter(m => m?.status === status).length : 0)

    const totals = useMemo(() => {
        const paidFromMonths = (rec, amt) => count(rec?.month, 'Paid') * Number(amt || 0)
        const dueFromMonths = (rec, amt) => count(rec?.month, 'Due') * Number(amt || 0)
        const isRec = (r) => !!r?.header?.recurring

        const incomingPaid = (incomingCHR || []).reduce((a, r) => a + (isRec(r) ? paidFromMonths(r, r.amount) : Number(r.amount || 0)), 0)
        const incomingDue  = (incomingCHR || []).reduce((a, r) => a + (isRec(r) ? dueFromMonths(r, r.amount) : 0), 0)
        const maintPaid    = (maintenance || []).reduce((a, m) => a + Number(m.maintenanceAmount || m.amount || 0), 0)

        const salaryPaid   = (salaries || []).reduce((a, s) => a + paidFromMonths(s, s.amount), 0)
        const chrExpPaid   = (expenseCHR || []).reduce((a, r) => a + (isRec(r) ? paidFromMonths(r, r.amount) : Number(r.amount || 0)), 0)
        const salaryDue    = (salaries || []).reduce((a, s) => a + dueFromMonths(s, s.amount), 0)
        const chrExpDue    = (expenseCHR || []).reduce((a, r) => a + (isRec(r) ? dueFromMonths(r, r.amount) : 0), 0)
        const expenseDue   = salaryDue + chrExpDue

        const totalIncomingReceived = incomingPaid + maintPaid
        const totalExpensePaid = salaryPaid + chrExpPaid
        const currentBalance = totalIncomingReceived - totalExpensePaid

        return { currentBalance, incomingDue, totalIncomingReceived, maintPaid, expenseDue }
    }, [incomingCHR, expenseCHR, salaries, maintenance])

    const entityCounts = useMemo(() => ({
        flats: Array.isArray(flats) ? flats.length : 0,
        employees: Array.isArray(employees) ? employees.length : 0,
        users: Array.isArray(users) ? users.length : 0,
    }), [flats, employees, users])

    return (
        <div className="container-fluid py-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="display-5 m-0" style={{ fontWeight: 900 }}>Admin Dashboard</h1>
                <img src={logo} alt="Lakhani Towers" style={{ height: 60 }} />
            </div>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "40vh" }}>
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            ) : (
                <>
                <div className="row g-3">
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#1d976c,#93f9b9)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Current Balance</h6>
                                    <span>💼</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{fmt(totals.currentBalance)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#f7971e,#ffd200)' }}>
                            <div className="card-body" style={{ cursor: 'pointer' }} onClick={()=>history.push('/dashboard/all-incomings?recurringOnly=true&status=due')}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Outstandings</h6>
                                    <span>⏳</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{fmt(totals.incomingDue)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#8E2DE2,#4A00E0)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Payables</h6>
                                    <span>📤</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{fmt(totals.expenseDue)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#00c6ff,#0072ff)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Total Amount Received</h6>
                                    <span>📥</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{fmt(totals.totalIncomingReceived)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#f85032,#e73827)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Paid Maintenance</h6>
                                    <span>🧾</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{fmt(totals.maintPaid)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#11998e,#38ef7d)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Total Flats</h6>
                                    <span>🏢</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{entityCounts.flats}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#7F00FF,#E100FF)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Total Employees</h6>
                                    <span>👷</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{entityCounts.employees}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg,#00b09b,#96c93d)' }}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-1 fw-bold">Total Users</h6>
                                    <span>👤</span>
                                </div>
                                <div className="fs-4 fw-bold mt-2">{entityCounts.users}</div>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}
        </div>
    )
}

export default Home