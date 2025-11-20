import React from 'react'

import { useState } from 'react'

import { useContext } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppContext from './context/appContext'
// import Spinner from './spinner'
export default function Admin() {
 
    // const { cloudinary } = context

    // const [file, setFile] = useState()

    // const sendFile = (e) => {
    //     e.preventDefault()
    //     cloudinary(file)


    // }

    

    const [credentials, setCredentials] = useState({email:"",password:""})
    const [loading, setLoading] = useState(false)
    const { adminLogin } = useContext(AppContext)
    const history = useHistory()

    const onSubmit = async (e) => {
        e.preventDefault()
        try{
            setLoading(true)
            await adminLogin(credentials.email, credentials.password)
            toast.success("Logged in successfully")
            history.push('/dashboard')
        }catch(err){
            toast.error(err?.message || "Invalid credentials")
        }finally{
            setLoading(false)
        }
    }

    // const {signIn,adminToken } = context

    // const { adminToken } = context
    // const history = useHistory()
    // if(adminToken){
    //     history.push("/admin-dashboard")
    // }
    // setImgIsLoaded(true)
    // setMainLoader(false)
    // setcheckouter(true)
    // // setEditorLoader(true)
    // const [password, setPassword] = useState("")
    // const declareLogin=(e)=>{
    //     e.preventDefault()
    //     loginAdmin(password)
     
    // }
    const color = "#6699ff"
    return (
        // <div  style={{marginTop:"150px"}}>
        //     <h1 className="text-center">This is admin panel</h1>
        //     <div className="d-flex justify-content-center">
        //         <form onSubmit={(e)=>sendFile(e)}>
        //         <input type="file" onChange={(e)=>{setFile(e.target.files[0])}} />
        //         <button type="submit">Submit</button>
        //         </form>
        //     </div>
        // </div>
        <div className='my-5'>
            <div className="pt-5">
                <div className="d-flex justify-content-center">
                    <div className="d-flex flex-column pt-5">
                        <div className="card  shadow-sm" style={{ width: '400px', backgroundColor: "#fff", border: `1px solid ${color}` }}>
                            <h1 className="text-center my-3" style={{ fontFamily: 'Montserret', color: color }}>Admin Panel</h1>
                            <form onSubmit={onSubmit}>
                                <div class="mb-3 mx-3">

                                    <input value={credentials.email} onChange={(e)=>{setCredentials({...credentials,email:e.target.value})}}   style={{ color: color, backgroundColor: '#fff', borderColor: color }} type="email" class="form-control my-2" id="exampleFormControlInput1" placeholder="Email" />
                                    <input value={credentials.password} onChange={(e)=>{setCredentials({...credentials,password:e.target.value})}}   style={{ color: color, backgroundColor: '#fff', borderColor: color }} type="password" class="form-control" id="exampleFormControlInput1" placeholder="Password" />
                                </div>
                                <div className="d-flex justify-content-center mt-2 mb-4">
                                    <button disabled={loading} type='submit' className="btn" style={{ color: color, borderColor: color, backgroundColor: '#fff' }}>{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Login'}</button>
                                </div>
                            </form>
                        </div>
                        {/* {loginLoader && <div className='d-flex justify-content-center'>
                            <Spinner />
                        </div>} */}
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}