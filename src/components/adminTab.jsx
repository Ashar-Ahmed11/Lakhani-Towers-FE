import React, { useEffect, useState, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import AppContext from '../context/appContext'
const AdminTab = () => {
  const history = useHistory()
  const { fetchAllProductsBE, products } = useContext(AppContext)
  const [filteredList, setFilteredList] = useState([])
  const [searchQuery, setsearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (!token) return history.push('/admin')
    ;(async () => {
      setLoading(true)
      await fetchAllProductsBE()
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (products?.length > 0) setFilteredList(products)
  }, [products])

  const filterBySearch = (e) => {
    e.preventDefault()
    if (!searchQuery) return setFilteredList(products)
    const updated = (products || []).filter((item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredList(updated)
  }

  const showHomeProducts = (e) => {
    if (e.target.checked) setFilteredList((products || []).filter((p) => p.homePreview))
    else setFilteredList(products)
  }

  return (
    <div className="my-2">
      <div className="container-fluid ">
      <h1 data-aos="fade-up" data-aos-duration="1000" className="display-4" style={{ fontWeight: 900 }}>Sample Lists</h1>

        <div className=" py-2">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <form onSubmit={filterBySearch}>
              <div className="d-flex align-items-center">
                <input value={searchQuery} onChange={(e) => setsearchQuery(e.target.value)} style={{ borderColor: "black", color: 'black', backgroundColor: "#ffffff" }} type="text" className="form-control" />
                <div className="px-2">
                  <button style={{ cursor: 'pointer', border: 'none', backgroundColor: "#fafafa" }} className='fas fa-search fa-lg'></button>
                </div>
              </div>
            </form>
            <div>
              <Link to='/dashboard/create-product'> <button style={{ borderColor: "#F4B92D", color: '#F4B92D' }} className="btn rounded-circle"><i className="fas fa-plus "></i></button></Link>
            </div>
          </div>
          <div className='mb-3' style={{ color: "#F4B92D" }}>
            <div className="d-flex align-items-center">
              <div className="form-check form-switch m-2">
                <input onChange={showHomeProducts} style={{ backgroundColor: "#F4B92D" }} className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
              </div>
              <span>Show Home Products</span>
            </div>
          </div>
          <div>
            {loading ? (
              <div className="py-5 text-center"><div style={{ width: '60px', height: '60px' }} className="spinner-border " role="status"><span className="visually-hidden">Loading...</span></div></div>
            ) : (
              <div className="row g-3">
                {(filteredList || []).map((e, i) => (
                  <div key={e._id} className="col-12">
                    <div className="card border-0 shadow-sm p-2">
                      <div className="d-flex align-items-center gap-3 flex-nowrap">
                        <div className="flex-shrink-0">
                          <img src={e.assets?.[0]?.url} alt={e.name} className="rounded" style={{ width: '72px', height: '72px', objectFit: 'cover' }} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <h6 className="mb-1">{e.name}</h6>
                            {e.homePreview ? <span className="badge" style={{ backgroundColor: '#F4B92D', color: '#fff' }}>HOME</span> : null}
                          </div>
                          <div className="text-muted small">Category: {e.category}</div>
                        </div>
                        <div className="text-end" style={{ minWidth: '110px' }}>
                          <div className="fw-semibold small mb-1">{Number(e.price || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                          <Link to={`/dashboard/create-product/${e._id}`} className="btn btn-outline-dark btn-sm">Edit</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  )
}

export default AdminTab

