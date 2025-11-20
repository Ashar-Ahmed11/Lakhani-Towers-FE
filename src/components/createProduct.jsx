import React from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useEffect } from 'react'
import JoditEditor, { Jodit } from 'jodit-react';
import { useParams } from 'react-router-dom'
import VariantsManager from './variantManager'
// import { Editor } from "react-draft-wysiwyg";
// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import ImageAdjuster from './imageAdjuster'

import AppContext from '../context/appContext'
export default function CreateProduct() {

    const params = useParams()
    const { prodid } = params
    const openModal = useRef(null)
    const history = useHistory()
    const [variants, setVariants] = useState([]);

    const { fetchAllProductsBE, fetchSingleProductBE, createProductBE, editProductBE, deleteProductBE, fetchCategories, categories } = useContext(AppContext)
    const [imgPreview, setImgPreview] = useState([])
    const modalRef = useRef(null)


    useEffect(() => {
        setImgPreview([])
        fetchCategories()
    }, [])



    const [components, setComponents] = useState({ namer: "", price: "", description: "", category: "", homePreview: false, youtubeLink: '' })
    console.log(components.category)
    const dispatchProduct = async (e) => {
        e.preventDefault()
        const payload = {
            name: components.namer,
            price: Number(components.price || 0),
            description: components.description,
            category: components.category,
            homePreview: components.homePreview,
            youtubeLink: components.youtubeLink,
            priceAED: Number(components.priceAED || 0),
            assets: imgPreview.map((x) => ({ url: x.url || x })),
            variants
        }
        if (prodid) await editProductBE(prodid, payload)
        else await createProductBE(payload)
        history.push('/dashboard/products')
    }
    const color = "#000000"
    const token = localStorage.getItem('auth-token')
    if (!token) {
        history.push('/admin')
    }

    console.log(imgPreview)

    const [firstdndElement, setfirstdndElement] = useState({ element: null, index: null })
    const [seconddndElement, setseconddndElement] = useState({ element: null, index: null })

    const changeOrder = () => {
        // imgPreview.splice(firstdndElement.index,0,seconddndElement.element.url)
        // imgPreview.splice(seconddndElement.index,1,firstdndElement.element.url)

        imgPreview.splice(firstdndElement.index, 1, seconddndElement.element)
        imgPreview.splice(seconddndElement.index, 1, firstdndElement.element)

        setImgPreview([...imgPreview])
    }

    console.log(firstdndElement)
    console.log(seconddndElement)

    // function arraymove(arr, fromIndex, toIndex) {

    //  ;
    // }
    useEffect(() => {
        if (prodid) (async () => {
            const data = await fetchSingleProductBE(prodid)
            if (data) {
                const { name, price, description, youtubeLink, homePreview, category, priceAED, _id, variants: vs, assets } = data
                setComponents({ namer: name, price: price, description: description, youtubeLink: youtubeLink, homePreview: homePreview, category: category, priceAED: priceAED, _id: _id })
                setVariants(vs || [])
                setImgPreview(assets || [])
            }
        })()
    }, [])

    useEffect(() => {

    }, [prodid])



    // console.log(components.category)

    const [editImageUrl, setEditImageUrl] = useState(null)

    const deleteModalRef = useRef(null)

    const removeImage = (element) => {
        const filteredImages = imgPreview.filter((e) => { return e._id !== element._id })
        setImgPreview(filteredImages)

    }
    console.log(components, imgPreview)





    return (
        <div>
            <div >
                <div className="p-3">
                    <h1 data-aos="fade-up" data-aos-duration="1000" className="display-4" style={{ fontWeight: 900 }}>{prodid ? "Edit Product" : "Create Product"}</h1>
                </div>
                <div className="container">
                    <form>

                        <input value={components.namer} onChange={(e) => setComponents({ ...components, namer: e.target.value })} style={{ color: color, backgroundColor: 'white', }} type="text" placeholder='Product Name' className="form-control my-2" />
                        <input value={components.price} onChange={(e) => setComponents({ ...components, price: e.target.value })} style={{ color: color, backgroundColor: 'white', }} type="text" placeholder='Product Price PKR' className="form-control my-2" />
                        {/* <input value={components.priceAED} onChange={(e) => setComponents({ ...components, priceAED: e.target.value })} style={{ color: color, backgroundColor: 'white',}} type="text" placeholder='Product Price AED' className="form-control my-2" /> */}

                        <VariantsManager variants={variants} setVariants={setVariants} />

                        <div>
                            <h5 className="mb-3">Product Images</h5>

                            <button onClick={(e) => { e.preventDefault(); openModal.current.click(); setEditImageUrl(null) }} style={{ color: color }} className="btn  border-1 shadow-sm border">Upload Image</button>
                            <>
                                {/* <button onClick={(e) => { e.preventDefault(); openModal.current.click() }} style={{ color: color }} className="btn mx-2">Reupload Image</button> */}
                                <button onClick={(e) => { e.preventDefault(); setImgPreview([]) }} style={{ color: color }} className="btn mx-2  border-1 shadow-sm border">Remove Images</button>
                            </>

                            {imgPreview && <div className="my-2">
                                <div className="row">
                                    {imgPreview.map((e, i) => {

                                        // return <div
                                        //     draggable

                                        //     onDragStart={() => { setfirstdndElement({ element: e, index: i }); console.log(i) }}
                                        //     onDragEnter={() => { setseconddndElement({ element: e, index: i }); console.log(i) }}
                                        //     onDragEnd={() => changeOrder()}
                                        //     className="col-lg-3 col-md-4 col-6 my-2">
                                        //     <div className="card">
                                        //         <div className="card-img">
                                        //             <img height="309px" src={e.url} alt="" />
                                        //         </div>

                                        return <div
                                            draggable
                                            onDragStart={() => { setfirstdndElement({ element: e, index: i }); console.log(i) }}
                                            onDragEnter={() => { setseconddndElement({ element: e, index: i }); console.log(i) }}
                                            onDragEnd={() => changeOrder()}

                                            className="col-md-4 col-lg-3 col-6 p-1"><div class="card" style={{}}>
                                                <img onClick={() => { /* no-op */ }} src={e.url || e} class="card-img-top " alt="..." />
                                                <span style={{ backgroundColor: '#000000', width: '30px', height: '30px', border: '1px solid #F4B92D', color: '#F4B92D' }} class="position-absolute top-0 start-100 translate-middle rounded-circle">
                                                    <p onClick={() => removeImage(e)} style={{ paddingTop: '2px', cursor: 'pointer' }} className='text-center'><i class="fas fa-times fa-lg"></i></p>
                                                    <span class="visually-hidden">New alerts</span>
                                                </span>
                                            </div>

                                        </div>


                                    })}

                                </div>
                            </div>}

                            <select value={components.category || ''} onChange={(e) => setComponents({ ...components, category: e.target.value })} class="form-select my-3" aria-label="Default select example">
                                <option value="">Select Category</option>
                                {categories?.map((e, i) => (
                                    <option key={i} value={e.mainHeading?.replace(' ', '').toLowerCase()}>
                                        {e.mainHeading?.toLowerCase()}
                                    </option>
                                ))}
                            </select>


                        </div>


                        <div class="form-check form-switch">
                            <input checked={components.homePreview} onChange={(e) => setComponents({ ...components, homePreview: e.target.checked })} style={{ backgroundColor: '#F4B92D' }} class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />

                            <label class="form-check-label" style={{ color: "#F4B92D" }} for="flexSwitchCheckDefault">Display On Home Page</label>
                        </div>
                        <input value={components.youtubeLink} onChange={(e) => setComponents({ ...components, youtubeLink: e.target.value })} style={{ color: color, backgroundColor: 'white', }} type="text" placeholder='Youtube Video URL' className="form-control my-2" />


                        <div className='my-2'>
                            <JoditEditor value={components.description} onBlur={(e) => { setComponents({ ...components, description: e }) }} />
                        </div>

                        {/* {prodid && <button onClick={(e) => addToMeta(e)} className="btn btn-primary">Add To Meta</button>} */}

                        <div className={`d-flex ${prodid ? 'justify-content-between' : 'justify-content-end'}     align-items-center my-3`}>
                            {prodid && <button onClick={(e) => { e.preventDefault(); deleteModalRef.current.click() }} className="btn btn-danger">Delete</button>}
                            <button onClick={(e) => dispatchProduct(e)} style={{ color: color }} className="btn my-2 border-1 shadow-sm border">{prodid ? 'Edit Product' : 'Create Product'}</button>
                        </div>
                    </form>


                </div>

            </div>








            <button ref={openModal} hidden={true} type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#imageAdjusterModal">Launch</button>
            <div className="modal fade" id="imageAdjusterModal" tabIndex="-1" aria-labelledby="imageAdjusterLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="imageAdjusterLabel">Adjust Image</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="px-2">
                                <ImageAdjuster imageUrl={editImageUrl} setEditImageUrl={setEditImageUrl} onUploaded={(url) => setImgPreview([...imgPreview, { url }])} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>






            <button hidden={true} ref={deleteModalRef} type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalDelete">
                Launch demo modal
            </button>


            <div class="modal fade " id="exampleModalDelete" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog  modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="exampleModalLabel">Product Deletion Warning</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <p>Are you sure you want to completely delete this product?</p>
                        </div>
                        <div class="modal-footer d-flex justify-content-between">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button onClick={() => deleteProductBE(prodid)} data-bs-dismiss="modal" type="button" class="btn btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

