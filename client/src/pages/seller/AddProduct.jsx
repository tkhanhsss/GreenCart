import { useState } from "react";
import { assets } from '../../assets/assets.js'
import { useAppContext } from '../../context/AppContext.jsx'
import toast from "react-hot-toast";

const INITIAL_FORM = { name: '', description: '', category: '', price: '', offerPrice: '' };

const AddProduct = () => {
    const [files, setFiles] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);

    const { axios, categories, currency } = useAppContext();

    const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();

            // Frontend Validation
            if (!form.name || !form.price || !form.offerPrice || !form.category) {
                return toast.error("Please fill in all required fields, including Category.");
            }
            if (Number(form.price) <= 0 || Number(form.offerPrice) <= 0) {
                return toast.error("Prices must be positive values.");
            }
            if (Number(form.offerPrice) > Number(form.price)) {
                return toast.error("Sale price cannot be greater than original price.");
            }
            
            const selectedFiles = files.filter(f => f); // remove empty spots
            if (selectedFiles.length === 0) {
                return toast.error("Please upload at least one image.");
            }

            const productData = { ...form, description: form.description.split('/n') };
            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            selectedFiles.forEach((file) => formData.append('images', file));

            const { data } = await axios.post('/api/product/add', formData);
            if (data.success) {
                toast.success(data.message);
                setForm(INITIAL_FORM);
                setFiles([]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="no-scrollbar flex-1 h-full overflow-y-auto">
            <div className="max-w-2xl w-full p-6 md:p-10">
                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Add New Product</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in the details to list a new product</p>
                    </div>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-6">
                    {/* Image Upload */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Product Images</p>
                        <p className="text-xs text-gray-400 mb-4">Upload up to 4 images. First image will be the main display.</p>
                        <div className="flex flex-wrap gap-3">
                            {Array(4).fill('').map((_, index) => (
                                <label key={index} htmlFor={`image${index}`}
                                    className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/3 transition-all overflow-hidden group">
                                    <input onChange={(e) => {
                                        const updatedFiles = [...files];
                                        updatedFiles[index] = e.target.files[0];
                                        setFiles(updatedFiles);
                                    }} accept="image/*" type="file" id={`image${index}`} hidden />
                                    {files[index] ? (
                                        <img className="w-full h-full object-cover" src={URL.createObjectURL(files[index])} alt="preview" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-gray-300 group-hover:text-primary/60 transition-colors">
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-[10px] font-medium">Add</span>
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <p className="text-sm font-semibold text-gray-700">Product Details</p>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="product-name">Product Name</label>
                            <input onChange={handleChange('name')} value={form.name}
                                id="product-name" type="text" placeholder="e.g. Organic Broccoli"
                                className="outline-none py-2.5 px-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm" required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="product-description">Description</label>
                            <textarea onChange={handleChange('description')} value={form.description}
                                id="product-description" rows={4}
                                className="outline-none py-2.5 px-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                                placeholder="Describe your product (use /n to separate bullet points)"></textarea>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="category">Category</label>
                            <select onChange={handleChange('category')} value={form.category} id="category"
                                className="outline-none py-2.5 px-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm cursor-pointer">
                                <option value="">Select a category</option>
                                {categories.map((item, index) => (
                                    <option key={index} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-700 mb-4">Pricing</p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="product-price">Original Price</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{currency}</span>
                                    <input onChange={handleChange('price')} value={form.price}
                                        id="product-price" type="number" placeholder="0"
                                        className="outline-none py-2.5 pl-8 pr-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm w-full" required />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="offer-price">Sale Price</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{currency}</span>
                                    <input onChange={handleChange('offerPrice')} value={form.offerPrice}
                                        id="offer-price" type="number" placeholder="0"
                                        className="outline-none py-2.5 pl-8 pr-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm w-full" required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit"
                        className="w-full py-3.5 bg-primary hover:bg-primary-dull text-white font-bold rounded-xl cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Product
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;