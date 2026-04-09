import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets.js'
import { useAppContext } from '../context/AppContext.jsx';
import { vietnamProvinces } from '../assets/vietnamProvinces.js';
import toast from 'react-hot-toast';

// Reusable text input
const InputField = ({ type, placeholder, name, handleChange, address }) => (
    <input
        className='w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition'
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={handleChange}
        value={address[name]}
        required
    />
);

// Reusable select dropdown
const SelectField = ({ name, value, onChange, children, disabled = false, placeholder }) => (
    <select
        className={`w-full px-2 py-2.5 border border-gray-500/30 rounded outline-none transition
            ${disabled
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-500 cursor-pointer focus:border-primary'
            }`}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
    >
        <option value='' disabled>{placeholder}</option>
        {children}
    </select>
);

function AddAddress() {
    const { axios, user, navigate } = useAppContext();

    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        ward: '',
        city: '',
        phone: ''
    });

    const [wards, setWards] = useState([]);
    const [loadingWards, setLoadingWards] = useState(false);

    const fetchWards = async (cityName) => {
        const province = vietnamProvinces.find(p => p.name === cityName);
        if (!province) return;

        setLoadingWards(true);
        setWards([]);

        try {
            const response = await fetch(
                `https://provinces.open-api.vn/api/v2/p/${province.apiCode}?depth=2`
            );
            const data = await response.json();

            const wardList = (data.wards || [])
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

            setWards(wardList);
        } catch {
            toast.error('Không thể tải danh sách Phường/Xã');
            setWards([]);
        } finally {
            setLoadingWards(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'city') {
            // Reset ward when province changes
            setAddress(prev => ({ ...prev, city: value, ward: '' }));
            fetchWards(value);
        } else {
            setAddress(prev => ({ ...prev, [name]: value }));
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/address/add', { address, userId: user._id });
            if (data.success) {
                toast.success(data.message);
                navigate('/cart');
            } else if (!data.message?.includes("account has been locked")) {
                toast.error(data.message);
            }
        } catch (error) {
            if (!error.message?.includes("account has been locked"))
                toast.error(error.message);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/cart');
        }
    }, []);

    return (
        <div className='mt-12 pb-12'>
            <p className='text-2xl md:text-3xl text-gray-500'>
                Add Shipping
                <span className='font-semibold text-primary-dull'>{" "}Address</span>
            </p>
            <div className='flex flex-col-reverse md:flex-row justify-between mt-4'>
                <div className='flex-1 max-w-md'>
                    <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>

                        {/* Name */}
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address} name='firstName' type='text' placeholder='First Name' />
                            <InputField handleChange={handleChange} address={address} name='lastName' type='text' placeholder='Last Name' />
                        </div>

                        {/* Email */}
                        <InputField handleChange={handleChange} address={address} name='email' type='email' placeholder='Email' />

                        {/* Street */}
                        <InputField handleChange={handleChange} address={address} name='street' type='text' placeholder='Street' />

                        {/* Ward dropdown — enabled after city is selected */}
                        <SelectField
                            name='ward'
                            value={address.ward}
                            onChange={handleChange}
                            disabled={!address.city || loadingWards}
                            placeholder={
                                loadingWards
                                    ? '⏳ Đang tải...'
                                    : address.city
                                        ? '-- Chọn Phường/Xã --'
                                        : '-- Chọn Tỉnh/Thành Phố trước --'
                            }
                        >
                            {wards.map(w => (
                                <option key={w.code} value={w.name}>{w.name}</option>
                            ))}
                        </SelectField>

                        {/* City / Province dropdown — placed below ward per user request */}
                        <SelectField
                            name='city'
                            value={address.city}
                            onChange={handleChange}
                            placeholder='-- Chọn Tỉnh/Thành Phố --'
                        >
                            {vietnamProvinces.map(province => (
                                <option key={province.name} value={province.name}>
                                    {province.name}
                                </option>
                            ))}
                        </SelectField>

                        {/* Phone */}
                        <InputField handleChange={handleChange} address={address} name='phone' type='text' placeholder='Phone' />

                        <button className='w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer'>
                            SAVE ADDRESS
                        </button>
                    </form>
                </div>
                <img className='md:mr-16 mb-12 md:mt-0' src={assets.add_address_image} alt='Add Address' />
            </div>
        </div>
    );
}

export default AddAddress;