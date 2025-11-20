import React from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import AppContext from '../context/appContext'
import JoditEditor from 'jodit-react'
import ImageAdjuster from './imageAdjuster'
import { useParams } from 'react-router-dom'
export default function CreateCategory() {
    const { catid } = useParams()
    const openModal = useRef(null)
    const history = useHistory()
    const { createCategory, fetchCategoryById, editCategory, deleteCategory } = useContext(AppContext)
    const [form, setForm] = useState({ mainHeading: '', metaTitle: '', metaDescription: '' })
    const [coverImage, setCoverImage] = useState('')
    const [categoryDescription, setCategoryDescription] = useState('')
    const openCoverModal = useRef(null)
    const makeCategory = async (e)=>{
        e.preventDefault()
        if (catid) await editCategory(catid, { ...form, coverImage, categoryDescription })
        else await createCategory({ ...form, coverImage, categoryDescription })
        history.push('/dashboard/categories')
    }
    const color = "#F4B92D"
    const token = localStorage.getItem('auth-token')
    if (!token) {
        history.push('/admin')
    }

    React.useEffect(() => {
        if (catid) (async () => {
            const c = await fetchCategoryById(catid)
            if (c) {
                setForm({ mainHeading: c.mainHeading || '', metaTitle: c.metaTitle || '', metaDescription: c.metaDescription || '' })
                setCoverImage(c.coverImage || '')
                setCategoryDescription(c.categoryDescription || '')
            }
        })()
    }, [catid])

    return (
        <div>
            <div >
                <div className=" p-3">
                <h1 data-aos="fade-up" data-aos-duration="1000" className="display-4" style={{ fontWeight: 900 }}>{catid ? 'Edit Category' : 'Create Category'}</h1>

                </div>
                <div className="container">
                    <form>

                        <input value={form.mainHeading} onChange={(e) => {setForm({ ...form, mainHeading: e.target.value })}}  type="text" placeholder='Category Name' className="form-control my-2" />
                        <div className="my-2">
                            <label className="form-label">Cover Image</label>
                            <br />
                            
                            {coverImage ? (
                                <div className="position-relative d-inline-block">
                                    <img src={coverImage} alt="cover" className="img-fluid border rounded-3" style={{ maxHeight: 180 }} />
                                    <button type="button" className="btn btn-sm btn-danger position-absolute" style={{ top: 5, right: 5 }} onClick={() => setCoverImage('')}>Remove</button>
                                </div>
                            ) : (
                                <button onClick={(e) => { e.preventDefault(); openCoverModal.current.click() }} className="btn btn-outline-secondary">Upload Cover</button>
                            )}
                        </div>
                        <input value={form.metaTitle} onChange={(e)=>setForm({ ...form, metaTitle: e.target.value })} type="text" placeholder='Meta Title' className="form-control my-2" />
                        <textarea value={form.metaDescription} onChange={(e)=>setForm({ ...form, metaDescription: e.target.value })} placeholder='Meta Description' className="form-control my-2" />
                        <div className='my-2'>
                            <label className="form-label">Category Description</label>
                            <JoditEditor value={categoryDescription} onBlur={(val)=>setCategoryDescription(val)} />
                        </div>
                        <div className={`d-flex ${catid ? 'justify-content-between' : 'justify-content-end'} align-items-center my-3`}>
                            {catid && (
                                <button type="button" className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#categoryDeleteModal">Delete</button>
                            )}
                            <button disabled={!form.mainHeading} onClick={(e)=>makeCategory(e)}   className="btn my-2 border border-1 shadow-sm">{catid ? 'Edit Category' : 'Create Category'}</button>
                        </div>
                    </form>
                </div>
            <button ref={openCoverModal} hidden={true} type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#categoryCoverModal">Launch</button>
            <div className="modal fade" id="categoryCoverModal" tabIndex="-1" aria-labelledby="categoryCoverLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="categoryCoverLabel">Upload Cover</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <ImageAdjuster modalId="categoryCoverModal" onUploaded={(url)=>setCoverImage(url)} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Delete Category Modal */}
            <div className="modal fade " id="categoryDeleteModal" tabIndex="-1" aria-labelledby="categoryDeleteLabel" aria-hidden="true">
                <div className="modal-dialog  modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="categoryDeleteLabel">Category Deletion Warning</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center">
                            <p>Are you sure you want to completely delete this category?</p>
                        </div>
                        <div className="modal-footer d-flex justify-content-between">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button onClick={() => { deleteCategory(catid); history.push('/dashboard/categories') }} data-bs-dismiss="modal" type="button" className="btn btn-danger">Delete</button>
                        </div>
                    </div>
                </div>
            </div>







     
        </div>
    )
}