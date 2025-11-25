import logo from './logo.svg';
import './App.css';
import { useContext } from 'react';
import AppContext from './components/context/appContext';
import { Switch, Route, Link, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Admin from './components/admin';
import Dashboard from './components/dashboard';
import CHRecordPDF from './components/customHeaders/CustomHeaderRecordPDF';
import SalaryPDF from './components/salaries/SalaryPDF';
import MaintenancePDF from './components/maintenance/MaintenancePDF';
import AllIncomingsPDF from './components/customHeaders/AllIncomingsPDF';
import AllExpensesPDF from './components/customHeaders/AllExpensesPDF';
import SalariesListPDF from './components/salaries/SalariesListPDF';
import MaintenanceListPDF from './components/maintenance/MaintenanceListPDF';
import ShopMaintenanceListPDF from './components/shopMaintenance/ShopMaintenanceListPDF';
import LoansListPDF from './components/loans/LoansListPDF';

function App() {
  const context = useContext(AppContext)
  const { helloworld } = context
  console.log(helloworld);
  const history = useHistory()

  return (
    <>

     
      <div>


        <Switch>


          <Route path="/" exact>
           {()=>{
            history.push('/dashboard')
            return(
              null
            )
           }}
          </Route>

          <Route path="/dashboard"  >
            <Dashboard />
          </Route>

          <Route path="/pdf/custom-headers/:id/record/:recordId" exact>
            <CHRecordPDF />
          </Route>
          <Route path="/pdf/salaries/:id" exact>
            <SalaryPDF />
          </Route>
          <Route path="/pdf/maintenance/:id" exact>
            <MaintenancePDF />
          </Route>
          <Route path="/pdf/all-incomings" exact>
            <AllIncomingsPDF />
          </Route>
          <Route path="/pdf/all-expenses" exact>
            <AllExpensesPDF />
          </Route>
          <Route path="/pdf/salaries" exact>
            <SalariesListPDF />
          </Route>
          <Route path="/pdf/maintenances" exact>
            <MaintenanceListPDF />
          </Route>
          <Route path="/pdf/shops-maintenance" exact>
            <ShopMaintenanceListPDF />
          </Route>
          <Route path="/pdf/loans" exact>
            <LoansListPDF />
          </Route>

          <Route path="/admin" exact>
            <Admin />
          </Route>
          <Route path="/about" exact>
            <h1 className="text-center">About Component</h1>
          </Route>
          <Route path="/users" exact>
            <h1 className="text-center">Users Component</h1>
          </Route>
        </Switch>
      </div>

    </>

  );
}

export default App;
