import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

const Users = () => {
    const { axios } = useAppContext();
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/user/admin/users");
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleDeleteUser = async (id, isDeletedObj) => {
        try {
            if (!window.confirm(`Are you sure you want to ${isDeletedObj ? 'restore' : 'lock'} this user?`)) {
                return;
            }
            const { data } = await axios.post(`/api/user/admin/toggle-delete/${id}`);
            if (data.success) {
                toast.success(data.message);
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === id ? { ...user, isDeleted: data.isDeleted } : user
                    )
                );
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="no-scrollbar flex-1 h-full overflow-y-auto">
            <div className="p-6 md:p-10">
                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">User Management</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                <div className="w-full max-w-4xl bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">No.</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user, index) => (
                                <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-4 hidden sm:table-cell text-gray-400 text-xs font-medium">{index + 1}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold
                                                ${user.isDeleted ? 'bg-gray-300' : 'bg-primary/80'}`}>
                                                {user.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate max-w-32 sm:max-w-none">{user.name}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-32 sm:max-w-none">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell text-gray-500 text-xs">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                                    </td>
                                    <td className="px-5 py-4">
                                        {user.isDeleted ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                Locked
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={() => toggleDeleteUser(user._id, user.isDeleted)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                                user.isDeleted
                                                    ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                                    : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                            }`}
                                        >
                                            {user.isDeleted ? "Restore" : "Lock"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
