import React, { useEffect } from "react";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useLocation
} from "react-router-dom";

import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import AdminLinks from "./adminLinks";
import Home from "./home";
import UsersPage from "./users/UsersPage";
import CreateUser from "./users/CreateUser";
import EditUser from "./users/EditUser";
import EmployeesPage from "./employees/EmployeesPage";
import CreateEmployee from "./employees/CreateEmployee";
import EditEmployee from "./employees/EditEmployee";
import FlatsPage from "./flats/FlatsPage";
import CreateFlat from "./flats/CreateFlat";
import EditFlat from "./flats/EditFlat";
import CreateCustomHeader from "./customHeaders/CreateCustomHeader";
import CustomHeaderPage from "./customHeaders/CustomHeaderPage";
import CustomHeadersPage from "./customHeaders/CustomHeadersPage";
import EditCustomHeader from "./customHeaders/EditCustomHeader";
import CreateCustomHeaderRecord from "./customHeaders/CreateCustomHeaderRecord";
import EditCustomHeaderRecord from "./customHeaders/EditCustomHeaderRecord";
import SalariesPage from "./salaries/SalariesPage";
import CreateSalary from "./salaries/CreateSalary";
import EditSalary from "./salaries/EditSalary";
import MaintenancePage from "./maintenance/MaintenancePage";
import CreateMaintenance from "./maintenance/CreateMaintenance";
import EditMaintenance from "./maintenance/EditMaintenance";


// import { useEffect } from "react";
const Dashboard = () => {
    const location = useLocation();

    const history = useHistory()


    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (!token) history.push('/admin');
    }, [history]);
   



    return (
        <div>
            {/* Navbar for mobile */}
            <nav className="navbar navbar-dark bg-secondary d-md-none">
                <div className="container-fluid">
                    <button
                        className="btn btn-outline-light"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#mobileSidebar"
                        aria-controls="mobileSidebar"
                    >
                        ☰ Menu
                    </button>

                    <div className="dropdown">
                        <a
                            href="#"
                            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                            id="dropdownUser1"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <div className="position-relative">
                                <img
                                    src="https://png.pngtree.com/png-vector/20220529/ourmid/pngtree-black-user-icon-flat-and-simple-vector-people-avatar-icon-vector-png-image_46750236.jpg"
                                    alt="profile"
                                    width="30"
                                    height="30"
                                    className="rounded-circle"
                                />
                                <span class="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                    <span class="visually-hidden">New alerts</span>
                                </span>
                            </div>
                            <span className="d-sm-inline mx-1">Admin</span>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end text-small shadow">

                            <li>
                                <a className="dropdown-item" href="#">
                                    {/* <ConnectKitButton showAvatar={false} /> */}

                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container-fluid">
                <div className="row flex-nowrap">
                    {/* Sidebar for larger screens */}
                    <div style={{ position: "sticky", height: "100vh", top: 0 }} className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-secondary d-none d-md-block">
                        <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100" style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '260px', overflowY: 'auto' }}>
                            <a
                                href="/dashboard/"
                                className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none"
                            >
                                <span className="fs-5 d-none d-sm-inline">Menu</span>
                            </a>
                            <ul
                                className="nav w-100 nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
                                id="menu"
                            >
                                <AdminLinks />
                            </ul>
                            <hr />
                            <div className="dropdown pb-4">
                                <a
                                    href="#"
                                    className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                                    id="dropdownUser1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <div className="position-relative">
                                        <img
                                            src="https://png.pngtree.com/png-vector/20220529/ourmid/pngtree-black-user-icon-flat-and-simple-vector-people-avatar-icon-vector-png-image_46750236.jpg"
                                            alt="profile"
                                            width="30"
                                            height="30"
                                            className="rounded-circle"
                                        />
                                        <span class="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
                                            <span class="visually-hidden">New alerts</span>
                                        </span>
                                    </div>
                                    <span className="d-none d-sm-inline mx-1">Admin</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-dark text-small shadow">

                                    <li>
                                        <a className="dropdown-item" href="#">
                                            {/* <ConnectKitButton showAvatar={false} /> */}

                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Offcanvas Sidebar for Mobile */}
                    <div
                        className="offcanvas offcanvas-start bg-secondary text-white"
                        id="mobileSidebar"
                        aria-labelledby="mobileSidebarLabel"
                    >
                        <div className="offcanvas-header">
                            <h5 className="offcanvas-title" id="mobileSidebarLabel">
                                Menu
                            </h5>
                            <button
                                type="button"
                                className="btn-close text-reset"
                                data-bs-dismiss="offcanvas"
                                aria-label="Close"
                                style={{ filter: "invert(1)", opacity: 1 }}
                            ></button>
                        </div>
                        <div className="offcanvas-body">
                            <ul className="nav nav-pills flex-column">

                                <AdminLinks mobile={true} />
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                 <div className="col py-3">
                 
                        <Switch>
                            <Route exact path="/dashboard/">
                            <Home/>
                            </Route>
                        </Switch>
                        <Switch>
                            <Route exact path="/dashboard/users" component={UsersPage} />
                            <Route exact path="/dashboard/create-user" component={CreateUser} />
                            <Route exact path="/dashboard/edit-user/:id" component={EditUser} />

                            <Route exact path="/dashboard/create-custom-header" component={CreateCustomHeader} />
                            <Route exact path="/dashboard/custom-headers" component={CustomHeadersPage} />
                            <Route exact path="/dashboard/custom-headers/:id" component={CustomHeaderPage} />
                            <Route exact path="/dashboard/edit-custom-header/:id" component={EditCustomHeader} />
                            <Route exact path="/dashboard/custom-headers/:id/create-record" component={CreateCustomHeaderRecord} />
                            <Route exact path="/dashboard/custom-headers/:id/edit-record/:recordId" component={EditCustomHeaderRecord} />

                            <Route exact path="/dashboard/transaction">
                                <h1 className="text-center">Transaction</h1>
                            </Route>
                            <Route exact path="/dashboard/downloads">
                                <h1 className="text-center">Downloads</h1>
                            </Route>
                            <Route exact path="/dashboard/flats" component={FlatsPage} />
                            <Route exact path="/dashboard/create-flat" component={CreateFlat} />
                            <Route exact path="/dashboard/edit-flat/:id" component={EditFlat} />
                            <Route exact path="/dashboard/employees" component={EmployeesPage} />
                            <Route exact path="/dashboard/create-employee" component={CreateEmployee} />
                            <Route exact path="/dashboard/edit-employee/:id" component={EditEmployee} />
                            <Route exact path="/dashboard/salaries" component={SalariesPage} />
                            <Route exact path="/dashboard/create-salary" component={CreateSalary} />
                            <Route exact path="/dashboard/edit-salary/:id" component={EditSalary} />

                            <Route exact path="/dashboard/maintenance" component={MaintenancePage} />
                            <Route exact path="/dashboard/create-maintenance" component={CreateMaintenance} />
                            <Route exact path="/dashboard/edit-maintenance/:id" component={EditMaintenance} />
                        </Switch>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default Dashboard;



// <Route path="/dashboard/user-dashboard/staking">
// <Staking/>

// </Route>
// <Route path="/dashboard/user-dashboard/transfer">
// <Transfer/>

// </Route>
// <Route path="/dashboard/user-dashboard/referrals">
// {/* <h1>hellworld</h1> */}
// <Referrals/>

// </Route>
// <Route path="/dashboard/user-dashboard/withdraw">
// <Withdraw/>

// </Route>