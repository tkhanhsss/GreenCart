import React, { useState } from 'react'
import { assets } from '../../assets/assets.js'
import { useAppContext } from '../../context/AppContext.jsx'
import toast from 'react-hot-toast'

const Categories = () => {
    const { axios, categories, fetchCategories } = useAppContext();
    const [image, setImage] = useState(false)
    const [name, setName] = useState('')

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('name', name)
            formData.append('image', image)
            const { data } = await axios.post('/api/category/add', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            if (data.success) {
                toast.success(data.message)
                setImage(false)
                setName('')
                fetchCategories()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const removeCategoryHandler = async (id) => {
        try {
            const { data } = await axios.post('/api/category/remove', { id })
            if (data.success) {
                toast.success(data.message)
                fetchCategories()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="no-scrollbar flex-1 h-full overflow-y-auto">
            <div className="p-6 md:p-10 max-w-4xl">
                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Categories</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Manage product categories</p>
                    </div>
                </div>

                {/* Add Category Form */}
                <form onSubmit={onSubmitHandler} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <p className="text-sm font-semibold text-gray-700 mb-5">Add New Category</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                        {/* Image Upload */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category Image</p>
                            <label htmlFor="image" className='cursor-pointer block'>
                                <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all
                                    ${image ? 'border-primary' : 'border-gray-200 hover:border-primary/50 bg-gray-50'}`}>
                                    {image ? (
                                        <img className='w-full h-full object-cover' src={URL.createObjectURL(image)} alt="" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-gray-300">
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-[10px] font-medium">Upload</span>
                                        </div>
                                    )}
                                </div>
                            </label>
                            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
                        </div>

                        {/* Name + Submit */}
                        <div className="flex-1 flex flex-col gap-3 w-full">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category Name</p>
                                <input onChange={(e) => setName(e.target.value)} value={name}
                                    className='w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm'
                                    type="text" placeholder='e.g. Vegetables' required />
                            </div>
                            <button type="submit"
                                className='w-full px-4 py-2.5 bg-primary hover:bg-primary-dull text-white font-semibold rounded-xl transition-all hover:shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm'>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Category
                            </button>
                        </div>
                    </div>
                </form>

                {/* Categories Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <h2 className="font-semibold text-gray-800 text-sm">All Categories</h2>
                        <span className="text-xs text-gray-400">{categories.length} total</span>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-100">
                                            <img className='max-w-full max-h-full object-contain p-1' src={item.image} alt={item.name} />
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 font-semibold text-gray-800 text-sm">{item.name}</td>
                                    <td className="px-5 py-3.5 text-center">
                                        <button onClick={() => removeCategoryHandler(item._id)}
                                            className='cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors'>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {categories.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">No categories found</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Categories
