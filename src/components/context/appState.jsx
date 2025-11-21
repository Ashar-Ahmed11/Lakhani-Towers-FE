import React from 'react'
import AppContext from './appContext'
import { useState, useMemo, useCallback, useEffect } from 'react'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

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
            // Salaries
            getSalaries, getSalaryById, createSalary, updateSalary, deleteSalary, getSalaryPublic,
            // Maintenance
            getMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance, getMaintenancePublic,
            // Custom Header Records
            getCustomHeaderRecords, getCustomHeaderRecordPublic, createCustomHeaderRecord, updateCustomHeaderRecord, deleteCustomHeaderRecord,
            uploadImage,
        }}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppState