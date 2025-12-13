import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateCustomHeaderRecord = () => {
  const { id } = useParams();
  const history = useHistory();
  const { customHeaders, getCustomHeaders, getFlats, getCustomHeaderRecords, createCustomHeaderRecord, getAdminMe, uploadImage, getSubHeaders } = useContext(AppContext);
  const [header, setHeader] = useState(null);
  const [loading, setLoading] = useState(true);

  const [flats, setFlats] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [user, setUser] = useState(null);

  const [amount, setAmount] = useState('');
  const [dateOfAddition, setDateOfAddition] = useState(new Date());
  const [purpose, setPurpose] = useState('');
  const [fromVendorName, setFromVendorName] = useState('');
  const [fromVendorPhone, setFromVendorPhone] = useState('');
  const [counterpartyType, setCounterpartyType] = useState('Resident'); // 'Resident' | 'Vendor'
  const [documentImages, setDocumentImages] = useState([]);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragTo, setDragTo] = useState(null);

  const [month, setMonth] = useState([]); // only when recurring
  const [subHeader, setSubHeader] = useState(null);
  const [subSearch, setSubSearch] = useState('');
  const [subResults, setSubResults] = useState([]);
  const [outstanding, setOutstanding] = useState({ amount: 0, status: 'Due', FromDate: new Date(), ToDate: new Date() });
  const [outLump, setOutLump] = useState('');

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    (async () => {
      const meCheck = await getAdminMe();
      if (meCheck && meCheck.role === 'manager' && meCheck.editRole === false) { history.push('/dashboard'); return; }
      let headersList = customHeaders;
      if (!headersList?.length) {
        headersList = await getCustomHeaders();
      }
      const h = (headersList || []).find(x => x._id === id);
      setHeader(h);
      const fs = await getFlats(); setFlats(fs || []);
      const me = await getAdminMe(); setAdmin(me || null);
      const subs = await getSubHeaders({ headerId: id });
      setSubResults(Array.isArray(subs) ? subs.slice(0, 7) : []);
      setLoading(false);
    })();
  }, [id]);

  const onSearch = (q) => {
    setSearch(q);
    if (!q.trim()) return setResults([]);
    const filtered = (flats || []).filter(f => {
      const ownerName = f?.owner?.userName || '';
      const ownerPhone = String(f?.owner?.userMobile || '');
      return (f.flatNumber || '').toLowerCase().includes(q.toLowerCase()) ||
             ownerName.toLowerCase().includes(q.toLowerCase()) ||
             ownerPhone.includes(q);
    }).slice(0,5);
    setResults(filtered);
  };

  const uploadDocs = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try{
      setLoading(true);
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      setDocumentImages(prev=>[...prev, ...urls]);
    }catch{
      toast.error('Upload failed');
    }finally{
      setLoading(false);
    }
  };

  const addMonth = () => setMonth([...month, { status: 'Pending', amount: 0, occuranceDate: new Date() }]);
  const removeMonth = (i) => setMonth(month.filter((_,idx)=>idx!==i));

  const onSubmit = async (e) => {
    e.preventDefault();
    try{
      setLoading(true);
      const base = {
        header: id,
        purpose,
        fromVendorName: counterpartyType === 'Vendor' ? fromVendorName : '',
        fromVendorPhone: counterpartyType === 'Vendor' ? fromVendorPhone : '',
        subHeader: subHeader?._id || null,
        documentImages: documentImages.map(url => ({ url })),
        amount: Number(amount||0),
        dateOfAddition,
      };
      let payload = { ...base, outstanding: {
        amount: Number(outstanding.amount || 0),
        status: outstanding.status,
        FromDate: outstanding.FromDate,
        ToDate: outstanding.ToDate,
      } };
      if (header.headerType === 'Expense') {
        payload = { ...payload, fromAdmin: admin?._id || null, toUser: counterpartyType === 'Resident' ? (user?._id || null) : null };
      } else {
        payload = { ...payload, fromUser: counterpartyType === 'Resident' ? (user?._id || null) : null, toAdmin: admin?._id || null };
      }
      if (header.recurring) payload.month = month.map(m => ({ status: m.status, amount: Number(m.amount||0), occuranceDate: m.occuranceDate }));
      const created = await createCustomHeaderRecord(payload);
      if (created?._id){
        toast.success('Record created');
        // reset form
        setPurpose('');
        setUser(null);
        setSubHeader(null);
        setFromVendorName('');
        setFromVendorPhone('');
        setAmount('');
        setDateOfAddition(new Date());
        setDocumentImages([]);
        setMonth([]);
        setSearch(''); setResults([]);
        setOutstanding({ amount: 0, status: 'Due', FromDate: new Date(), ToDate: new Date() });
        setOutLump('');
      } else throw new Error('Create failed');
    }catch(err){
      toast.error(err?.message || 'Error creating record');
    }finally{
      setLoading(false);
    }
  };

  if (loading || !header) return <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>;

  return (
    <div className="container py-3">
      <h1 className="display-4" style={{ fontWeight: 900 }}>Create Record - {header.headerName}</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">Purpose</h5>
        <input value={purpose} onChange={(e)=>setPurpose(e.target.value)} className="form-control" placeholder="Purpose (optional)" />
        <div className="mt-3">
          <div className="btn-group">
            <button
              type="button"
              className={`btn ${counterpartyType==='Resident'?'btn-primary':'btn-outline-primary'}`}
              onClick={()=>{
                setCounterpartyType('Resident');
                setFromVendorName('');
                setFromVendorPhone('');
              }}
            >Resident</button>
            <button
              type="button"
              className={`btn ${counterpartyType==='Vendor'?'btn-primary':'btn-outline-primary'}`}
              onClick={()=>{
                setCounterpartyType('Vendor');
                setUser(null);
                setSearch(''); setResults([]);
              }}
            >Vendor</button>
          </div>
        </div>
        {counterpartyType==='Resident' && <h5 className="mt-3">{header.headerType === 'Expense' ? 'To Flat' : 'From Flat'}</h5>}
        {counterpartyType==='Resident' && !user && (
          <>
            <input value={search} onChange={(e)=>onSearch(e.target.value)} className="form-control" placeholder="Search flat (number, owner name or phone)..." />
            {search.trim() && results.length>0 && (
              <ul className="list-group my-2">
                {results.map(f => (
                  <li key={f._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setUser(f); setSearch(''); setResults([]); }}>
                    {f.flatNumber} - {f?.owner?.userName || ''} {f?.owner?.userMobile ? `(${f.owner.userMobile})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {counterpartyType==='Resident' && user && (
          <div className="list-group my-2">
            <div className="list-group-item active d-flex justify-content-between align-items-center">
              <span>{user.flatNumber} {user?.owner?.userName ? `- ${user.owner.userName}` : ''} {user?.owner?.userMobile ? `(${user.owner.userMobile})` : ''}</span>
              <button type="button" className="btn-close" onClick={()=>setUser(null)} />
            </div>
          </div>
        )}
        {counterpartyType==='Vendor' && (
          <>
            <h6 className="mt-2">Vendor Name (optional)</h6>
            <input value={fromVendorName} onChange={(e)=>setFromVendorName(e.target.value)} className="form-control" placeholder="Vendor name" />
            <h6 className="mt-2">Vendor Phone (optional)</h6>
            <input value={fromVendorPhone} onChange={(e)=>setFromVendorPhone(e.target.value)} className="form-control" placeholder="Vendor phone" />
          </>
        )}

        <h5 className="mt-3">Sub Header (optional)</h5>
        {!subHeader && (
          <>
            <input value={subSearch} onChange={async (e)=>{ 
              const v = e.target.value; setSubSearch(v);
              const list = await getSubHeaders({ headerId: id, q: v });
              setSubResults(Array.isArray(list) ? list.slice(0,7) : []);
            }} className="form-control" placeholder="Search sub header..." />
            {subResults.length>0 && (
              <ul className="list-group my-2">
                {subResults.map(s => (
                  <li key={s._id} className="list-group-item" style={{cursor:'pointer'}} onClick={()=>{ setSubHeader(s); setSubSearch(''); }}>
                    {s.subHeaderName}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {subHeader && (
          <div className="list-group my-2">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <span>{subHeader.subHeaderName}</span>
              <button type="button" className="btn-close" onClick={()=>setSubHeader(null)} />
            </div>
          </div>
        )}

        <h5 className="mt-3">Amount</h5>
        <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="form-control" placeholder="Amount" />

        {header.recurring && (
          <>
            <h5 className="mt-3">Months</h5>
            <button type="button" className="btn btn-sm btn-outline-primary mb-2" onClick={addMonth}>+ Add Month</button>
            {month.map((m,i)=>(
              <div key={i} className="card rounded-3 my-2 p-2">
                <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn ${m.status==='Paid'?'btn-success':'btn-outline-success'}`}
                      onClick={()=>setMonth(month.map((x,idx)=>idx===i?{...x, status: x.status==='Paid'?'Pending':'Paid'}:x))}
                    >Paid</button>
                    <button
                      type="button"
                      className={`btn ${m.status==='Due'?'btn-danger':'btn-outline-secondary'} ms-2`}
                      onClick={()=>setMonth(month.map((x,idx)=>idx===i?{...x, status: x.status==='Due'?'Pending':'Due'}:x))}
                      disabled={m.status==='Paid'}
                    >Due</button>
                  </div>
                  <input className="form-control w-auto" type="number" value={m.amount} onChange={(e)=>setMonth(month.map((x,idx)=>idx===i?{...x, amount:e.target.value}:x))} placeholder="Amount" />
                  <DatePicker dateFormat="dd/MM/yy" className='form-control w-auto' selected={new Date(m.occuranceDate)} onChange={(date)=>setMonth(month.map((x,idx)=>idx===i?{...x, occuranceDate:date}:x))} />
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>removeMonth(i)}>×</button>
                </div>
              </div>
            ))}
            <h5 className="mt-3">Outstanding</h5>
            <div className="border border-1 rounded-3 p-2 ">
              <div className="row g-2 border-1">
                <div className="col-md-3">
                  <input className="form-control" type="number" value={outstanding.amount} onChange={(e)=>setOutstanding({...outstanding, amount: e.target.value})} placeholder="Outstanding amount" />
                </div>
                <div className="col-md-3">
                  <div className="btn-group">
                    <button type="button" className={`btn btn-${outstanding.status==='Due'?'danger':'outline-danger'}`} onClick={()=>setOutstanding({...outstanding, status:'Due'})}>Due</button>
                    <button type="button" className={`btn btn-${outstanding.status==='Paid'?'success':'outline-success'} ms-2`} onClick={()=>setOutstanding({...outstanding, status:'Paid'})}>Paid</button>
                  </div>
                </div>
                <div className="col-md-3">
                  <DatePicker dateFormat="dd/MM/yy" className='form-control' selected={new Date(outstanding.FromDate)} onChange={(date)=>setOutstanding({...outstanding, FromDate:date})} />
                </div>
                <div className="col-md-3">
                  <DatePicker dateFormat="dd/MM/yy" className='form-control' selected={new Date(outstanding.ToDate)} onChange={(date)=>setOutstanding({...outstanding, ToDate:date})} />
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <input className="form-control w-auto" type="number" value={outLump} onChange={(e)=>setOutLump(e.target.value)} placeholder="Outstanding lumpsum" />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={()=>{
                    const v = Number(outLump||0);
                    const curr = Number(outstanding.amount||0);
                    if (v <= 0 || v >= curr) return;
                    setOutstanding({...outstanding, amount: curr - v});
                    setOutLump('');
                  }}
                  disabled={Number(outLump||0) <= 0 || Number(outLump||0) >= Number(outstanding.amount||0)}
                >Lumpsum</button>
              </div>
            </div>
          </>
        )}

        <h5 className="mt-3">Date Of Addition</h5>
        <DatePicker dateFormat="dd/MM/yy" className='form-control' selected={dateOfAddition} onChange={(date) => setDateOfAddition(date)} />

        <h5 className="mt-3">Document Images</h5>
        <div className="input-group mb-3">
          <input onChange={uploadDocs} type="file" className="form-control" multiple />
          <label className="input-group-text">Upload</label>
          {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        <div className="d-flex flex-wrap gap-2">
          {documentImages.map((url, idx)=>(
            <div
              key={idx}
              className="position-relative"
              draggable
              onDragStart={()=>setDragFrom(idx)}
              onDragEnter={()=>setDragTo(idx)}
              onDragEnd={()=>{
                if(dragFrom==null || dragTo==null || dragFrom===dragTo) return;
                const next = [...documentImages];
                const [moved] = next.splice(dragFrom,1);
                next.splice(dragTo,0,moved);
                setDocumentImages(next);
                setDragFrom(null); setDragTo(null);
              }}
            >
              <img src={url} alt="doc" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <span onClick={()=>setDocumentImages(documentImages.filter((_,i)=>i!==idx))} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-end mt-3">
          <button disabled={loading || (admin && (typeof admin.editRole==='boolean') && admin.editRole===false)} className="btn btn-outline-success">
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Record'}
          </button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateCustomHeaderRecord;


