import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from '../context/appContext';

const CreateUser = () => {
  const { createUser, uploadImage } = useContext(AppContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [userPhoto, setUserPhoto] = useState(null);
  const [dateOfJoining, setDateOfJoining] = useState(new Date());

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const url = await uploadImage(file);
      setUserPhoto(url);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { userName, userMobile: Number(userMobile || 0), userPhoto, dateOfJoining };
      const created = await createUser(payload);
      if (created?._id) {
        toast.success('User created');
        history.push(`/dashboard/edit-user/${created._id}`);
      } else {
        throw new Error('Create failed');
      }
    } catch (err) {
      toast.error(err?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h1 className="display-6">Create User</h1>
      <form onSubmit={onSubmit}>
        <h5 className="mt-3">User Name</h5>
        <input value={userName} onChange={(e)=>setUserName(e.target.value)} className="form-control" placeholder="Full Name" />

        <h5 className="mt-3">User Photo</h5>
        <div className="input-group mb-3">
          <input onChange={onPhotoChange} type="file" className="form-control" />
          <label className="input-group-text">User Image</label>
          {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}
        </div>
        {userPhoto && (
          <div className="position-relative d-inline-block mb-2">
            <img src={userPhoto} alt="User" style={{ maxWidth: 150, borderRadius: 8 }} />
            <span onClick={()=>setUserPhoto(null)} style={{ position:'absolute', top:-10, right:-10, background:'#000', width:30, height:30, border:'1px solid #F4B92D', color:'#F4B92D', borderRadius:'50%', cursor:'pointer' }} className="d-flex align-items-center justify-content-center">×</span>
          </div>
        )}

        <h5 className="mt-3">User Mobile</h5>
        <input value={userMobile} onChange={(e)=>setUserMobile(e.target.value)} className="form-control" placeholder="03xxxxxxxxx" />

        <h5 className="mt-3">Date Of Joining</h5>
        <DatePicker dateFormat="dd/MM/yyyy" className='form-control' selected={dateOfJoining} onChange={(date) => setDateOfJoining(date)} />

        <div className="d-flex justify-content-end mt-3">
          <button disabled={loading} className="btn btn-outline-success">{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Create User'}</button>
        </div>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default CreateUser;


