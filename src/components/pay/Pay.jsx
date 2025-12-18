import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import AppContext from '../context/appContext';

const Card = ({ title, desc, to, icon, variant }) => {
  const history = useHistory();
  const bg = variant ? `bg-${variant}` : 'bg-primary';
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div
        className={`card border-0 ${bg} text-white shadow-sm rounded-4`}
        style={{ cursor:'pointer', transition:'transform .15s ease, box-shadow .15s ease' }}
        onClick={()=>history.push(to)}
        onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.classList.add('shadow'); }}
        onMouseLeave={(e)=>{ e.currentTarget.style.transform='none'; e.currentTarget.classList.remove('shadow'); }}
      >
        <div className="card-body d-flex align-items-center gap-3">
          <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center" style={{ width:56, height:56 }}>
            <i className={`fs-3 ${icon||'fa fa-money'}`}></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0">{title}</h5>
              <i className="fa fa-angle-right fs-3"></i>
            </div>
            {desc ? <div className="small text-white-50 mt-1">{desc}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pay = () => {
  const { getAdminMe } = useContext(AppContext);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ (async()=>{ setMe(await getAdminMe()); setLoading(false); })(); }, [getAdminMe]);
  if (loading) return <div className="py-5 text-center"><div style={{ width: 60, height: 60 }} className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  const bool = (v) => v === true || v === 'true' || v === 1 || v === '1';
  const role = String(me?.role||'').toLowerCase();
  const isAdmin = role === 'admin' || bool(me?.isAdmin);
  const isManager = role === 'manager' && !isAdmin;
  const canAll = isAdmin || bool(me?.payAllAmounts);
  const canShop = isAdmin || bool(me?.payAllAmounts) || bool(me?.payOnlyShopMaintenance);
  const canSalaries = isAdmin || bool(me?.payAllAmounts) || bool(me?.salariesDistribution);
  return (
    <div className="container py-3">
      <div className="d-flex align-items-end justify-content-between">
        <div>
          <h1 className="display-5 mb-0" style={{ fontWeight: 900 }}>Pay</h1>
          <div className="text-muted">Choose what you want to pay</div>
        </div>
      </div>
      <div className="row g-3 mt-3">
        {canAll && <Card title="Receive Maintenance" desc="Flats: Outstandings, Other, Monthly" to="/dashboard/pay-maintenance" icon="fa fa-home" variant="primary" />}
        {canShop && <Card title="Receive Shop Maintenance" desc="Shops: Outstandings, Other, Monthly" to="/dashboard/pay-shop-maintenance" icon="fa fa-shopping-cart" variant="info" />}
        {canSalaries && <Card title="Pay Salaries" desc="Employees: Payables, Monthly, Loan" to="/dashboard/pay-salaries" icon="fa fa-users" variant="warning" />}
        {canAll && <Card title="Pay KE Electricity Bill" desc="Search by consumer number" to="/dashboard/pay-electricity-bill" icon="fa fa-bolt" variant="danger" />}
        {canAll && <Card title="Pay Miscellaneous" desc="Search GivenTo / LineItem / Remarks" to="/dashboard/pay-misc" icon="fa fa-file-text-o" variant="secondary" />}
        {canAll && <Card title="Receive Events" desc="Receive incoming for events" to="/dashboard/receive-events" icon="fa fa-calendar" variant="success" />}
      </div>
    </div>
  );
};

export default Pay;


