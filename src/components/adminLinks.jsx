import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
} from "react-router-dom";

const AdminLinks = ({mobile}) => {
        const location = useLocation();
    
    return (
        <>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
               
                    to="/dashboard"
                    className={`customlinks nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Home</span>
                </Link>
            </li>

            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/transaction"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/transaction") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Create Transaction</span>
                </Link>
            </li>
            <li  data-bs-dismiss={mobile&&"offcanvas"} className="nav-item w-100 py-2">
                <Link
              
                    to="/dashboard/users"
                    className={`customlinks nav-link ${location.pathname.startsWith("/dashboard/users") ? "active" : ""}`}
                >
                    <i className="fs-4 bi-house"></i>{" "}
                    <span className="ms-1 text-light">Users</span>
                </Link>
            </li>
            
     
        </>
    )
}

export default AdminLinks