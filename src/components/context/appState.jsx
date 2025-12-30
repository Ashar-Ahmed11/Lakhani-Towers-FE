import React from 'react'
import AppContext from './appContext'
import { useState, useMemo, useCallback, useEffect } from 'react'

// const API_BASE = process.env.REACT_APP_API_BASE || 'https://lakhaniexserver-dot-arched-gear-433017-u9.de.r.appspot.com/';
const API_BASE = "http://localhost:8000";

const AppState = (props) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('auth-token') || null);
    const [customHeaders, setCustomHeaders] = useState([]);

    const headers = useMemo(() => ({
        'Content-Type': 'application/json',
        ...(authToken ? { 'auth-token': authToken } : {}),
    }), [authToken]);

    const saveToken = useCallback((token) => {
        setAuthToken(token);
        if (token) localStorage.setItem('auth-token', token);
        else localStorage.removeItem('auth-token');
    }, []);

    // Shops
    const getShops = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/shops`, { headers });
        return await res.json();
    }, [headers]);

    const getShopById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/shops/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createShop = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/shops`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateShop = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/shops/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteShop = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/shops/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Shops Maintenance
    const getShopMaintenance = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.status) qs.set('status', opts.status);
        if (opts.q) qs.set('q', opts.q);
        const url = `${API_BASE}/api/shops-maintenance${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getShopMaintenanceById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/shops-maintenance/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createShopMaintenance = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/shops-maintenance`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateShopMaintenance = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/shops-maintenance/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteShopMaintenance = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/shops-maintenance/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Electricity Bills
    const getElectricityBills = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.q) qs.set('q', opts.q);
        const url = `${API_BASE}/api/electricity-bills${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getElectricityBillById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/electricity-bills/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createElectricityBill = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/electricity-bills`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateElectricityBill = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/electricity-bills/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteElectricityBill = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/electricity-bills/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    const payElectricityBill = useCallback(async (id, amount) => {
        const res = await fetch(`${API_BASE}/api/electricity-bills/${id}/pay`, {
            method: 'POST', headers, body: JSON.stringify({ amount })
        });
        return await res.json();
    }, [headers]);

    // Miscellaneous Expenses
    const getMiscExpenses = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.q) qs.set('q', opts.q);
        const url = `${API_BASE}/api/miscellaneous-expenses${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getMiscExpenseById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/miscellaneous-expenses/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createMiscExpense = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/miscellaneous-expenses`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateMiscExpense = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/miscellaneous-expenses/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteMiscExpense = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/miscellaneous-expenses/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    const payMiscExpense = useCallback(async (id, amount) => {
        const res = await fetch(`${API_BASE}/api/miscellaneous-expenses/${id}/pay`, {
            method: 'POST', headers, body: JSON.stringify({ amount })
        });
        return await res.json();
    }, [headers]);

    // Events (Incomings)
    const getEvents = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.q) qs.set('q', opts.q);
        const url = `${API_BASE}/api/events${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getEventById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/events/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createEvent = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/events`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateEvent = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/events/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteEvent = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/events/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    const receiveEventAmount = useCallback(async (id, amount) => {
        const res = await fetch(`${API_BASE}/api/events/${id}/receive`, {
            method: 'POST', headers, body: JSON.stringify({ amount })
        });
        return await res.json();
    }, [headers]);
    // Receipts
    const getReceipts = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.q) qs.set('q', opts.q);
        if (opts.type) qs.set('type', opts.type); // 'Paid' | 'Recieved'
        const url = `${API_BASE}/api/receipts${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getReceiptById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/receipts/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createReceipt = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/receipts`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    // Month Close (Previous Month Closing KPI support)
    const runMonthClose = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.forceMonthly) qs.set('forceMonthly', 'true');
        if (opts.force) qs.set('force', 'true');
        if (typeof opts.balance !== 'undefined') qs.set('balance', String(opts.balance));
        const url = `${API_BASE}/api/month-close/run${qs.toString() ? `?${qs.toString()}` : ''}`;
        const body = typeof opts.currentBalance !== 'undefined'
          ? JSON.stringify({ currentBalance: opts.currentBalance })
          : undefined;
        const res = await fetch(url, { method: 'POST', headers, body });
        return await res.json();
    }, [headers]);

    const getMonthClose = useCallback(async (month) => {
        const qs = new URLSearchParams();
        if (month) qs.set('month', month);
        const url = `${API_BASE}/api/month-close${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getPreviousMonthClose = useCallback(async (start, opts = {}) => {
        const qs = new URLSearchParams();
        if (start) qs.set('start', start);
        if (opts.forceCompute) qs.set('forceCompute', 'true');
        const url = `${API_BASE}/api/month-close/previous${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);
    // Auth
    const adminLogin = useCallback(async (email, password) => {
        const res = await fetch(`${API_BASE}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Login failed');
        saveToken(data.authToken);
        return data;
    }, [saveToken]);

    const getAdminMe = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/admin/me`, { headers });
        const data = await res.json();
        // Normalize role for consumers: backend /me returns Admin without role
        if (res.ok && data && !data.role) {
            if (typeof data.fullName === 'string') data.role = 'manager';
            else data.role = 'admin';
        }
        return data;
    }, [headers]);

    // Managers (admin only)
    const getManagers = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/managers`, { headers });
        return await res.json();
    }, [headers]);

    const getManagerById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/managers/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createManager = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/managers`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateManager = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/managers/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteManager = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/managers/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Custom Headers
    const getCustomHeaders = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/custom-headers`, { headers });
        const data = await res.json();
        if (res.ok) setCustomHeaders(data || []);
        return data;
    }, [headers]);

    const createCustomHeader = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/custom-headers`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        const data = await res.json();
        return data;
    }, [headers]);

    const updateCustomHeader = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/custom-headers/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteCustomHeader = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/custom-headers/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Users
    const getUsers = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/users`, { headers });
        return await res.json();
    }, [headers]);

    const getUserById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/users/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createUser = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/users`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateUser = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/users/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteUser = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/users/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Employees (stubs ready)
    const getEmployees = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/employees`, { headers });
        return await res.json();
    }, [headers]);

    const createEmployee = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/employees`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateEmployee = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/employees/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteEmployee = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/employees/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    const getEmployeeById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/employees/${id}`, { headers });
        return await res.json();
    }, [headers]);

    // Flats
    const getFlats = useCallback(async () => {
        const res = await fetch(`${API_BASE}/api/flats`, { headers });
        return await res.json();
    }, [headers]);

    const getFlatById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/flats/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createFlat = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/flats`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateFlat = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/flats/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteFlat = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/flats/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Salaries
    const getSalaries = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.status) qs.set('status', opts.status);
      if (opts.employeeId) qs.set('employeeId', opts.employeeId);
        const url = `${API_BASE}/api/salaries${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getSalaryById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/salaries/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createSalary = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/salaries`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateSalary = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/salaries/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteSalary = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/salaries/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    const getSalaryPublic = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/salaries/public/${id}`);
        return await res.json();
    }, []);

    // Maintenance
    const getMaintenance = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.status) qs.set('status', opts.status);
        const url = `${API_BASE}/api/maintenance${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getMaintenanceById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/maintenance/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createMaintenance = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/maintenance`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateMaintenance = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/maintenance/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteMaintenance = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/maintenance/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    const getMaintenancePublic = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/maintenance/public/${id}`);
        return await res.json();
    }, []);

    // Loans
    const getLoans = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
      if (opts.toId) qs.set('toId', opts.toId);
        if (opts.status) qs.set('status', opts.status);
        if (opts.q) qs.set('q', opts.q);
        const url = `${API_BASE}/api/loans${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getLoanById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/loans/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createLoan = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/loans`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateLoan = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/loans/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteLoan = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/loans/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);
    // Custom Header Records
    const getCustomHeaderRecords = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.from) qs.set('from', opts.from);
        if (opts.to) qs.set('to', opts.to);
        if (opts.headerType) qs.set('headerType', opts.headerType);
        if (typeof opts.recurring !== 'undefined') qs.set('recurring', String(opts.recurring));
        if (opts.status) qs.set('status', opts.status);
        const url = `${API_BASE}/api/custom-header-records${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getCustomHeaderRecordPublic = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/custom-header-records/public/${id}`);
        return await res.json();
    }, []);

    const createCustomHeaderRecord = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/custom-header-records`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateCustomHeaderRecord = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/custom-header-records/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteCustomHeaderRecord = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/custom-header-records/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Sub Headers
    const getSubHeaders = useCallback(async (opts = {}) => {
        const qs = new URLSearchParams();
        if (opts.q) qs.set('q', opts.q);
        if (opts.headerId) qs.set('headerId', opts.headerId);
        const url = `${API_BASE}/api/sub-headers${qs.toString() ? `?${qs.toString()}` : ''}`;
        const res = await fetch(url, { headers });
        return await res.json();
    }, [headers]);

    const getSubHeaderById = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/sub-headers/${id}`, { headers });
        return await res.json();
    }, [headers]);

    const createSubHeader = useCallback(async (payload) => {
        const res = await fetch(`${API_BASE}/api/sub-headers`, {
            method: 'POST', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const updateSubHeader = useCallback(async (id, payload) => {
        const res = await fetch(`${API_BASE}/api/sub-headers/${id}`, {
            method: 'PUT', headers, body: JSON.stringify(payload)
        });
        return await res.json();
    }, [headers]);

    const deleteSubHeader = useCallback(async (id) => {
        const res = await fetch(`${API_BASE}/api/sub-headers/${id}`, {
            method: 'DELETE', headers
        });
        return await res.json();
    }, [headers]);

    // Utility: Cloudinary upload
    const uploadImage = useCallback(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "for_mobile");
        const res = await fetch(`https://api.cloudinary.com/v1_1/dqu8eh3hz/image/upload`, { method: "POST", body: data });
        const uploaded = await res.json();
        if (!uploaded.secure_url) throw new Error('Upload failed');
        return uploaded.secure_url;
    }, []);

    useEffect(() => {
        if (authToken) getCustomHeaders();
    }, [authToken, getCustomHeaders]);
    
    return (
        <AppContext.Provider value={{
            authToken, saveToken,
            customHeaders, getCustomHeaders, createCustomHeader,
            updateCustomHeader, deleteCustomHeader,
            adminLogin,
            getUsers, getUserById, createUser, updateUser, deleteUser,
            getEmployees, createEmployee, updateEmployee, deleteEmployee,
            getEmployeeById,
            getFlats, getFlatById, createFlat, updateFlat, deleteFlat,
            // Admin helpers
            getAdminMe,
            // Managers
            getManagers, getManagerById, createManager, updateManager, deleteManager,
            // Salaries
            getSalaries, getSalaryById, createSalary, updateSalary, deleteSalary, getSalaryPublic,
            // Maintenance
            getMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance, getMaintenancePublic,
            // Loans
            getLoans, getLoanById, createLoan, updateLoan, deleteLoan,
            // Custom Header Records
            getCustomHeaderRecords, getCustomHeaderRecordPublic, createCustomHeaderRecord, updateCustomHeaderRecord, deleteCustomHeaderRecord,
            // Sub Headers
            getSubHeaders, getSubHeaderById, createSubHeader, updateSubHeader, deleteSubHeader,
            // Shops
            getShops, getShopById, createShop, updateShop, deleteShop,
            // Shops Maintenance
            getShopMaintenance, getShopMaintenanceById, createShopMaintenance, updateShopMaintenance, deleteShopMaintenance,
            // Electricity Bills
            getElectricityBills, getElectricityBillById, createElectricityBill, updateElectricityBill, deleteElectricityBill, payElectricityBill,
            // Miscellaneous Expenses
            getMiscExpenses, getMiscExpenseById, createMiscExpense, updateMiscExpense, deleteMiscExpense, payMiscExpense,
            // Events (Incomings)
            getEvents, getEventById, createEvent, updateEvent, deleteEvent, receiveEventAmount,
            // Receipts
            getReceipts, getReceiptById, createReceipt,
            // Month Close
            runMonthClose, getMonthClose, getPreviousMonthClose,
            uploadImage,
        }}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppState