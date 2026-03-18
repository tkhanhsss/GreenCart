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
             // For safety confirmation (optional but recommended in real app)
             if (!window.confirm(`Are you sure you want to ${isDeletedObj ? 'restore' : 'lock'} this user?`)) {
                return;
             }

            const { data } = await axios.post(`/api/user/admin/toggle-delete/${id}`);
            if (data.success) {
                toast.success(data.message);
                // Cập nhật lại list realtime không cần reload
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
        <div className="flex-1 min-h-screen flex flex-col items-start justify-start p-4 sm:p-8 bg-white overflow-x-auto">
            <h2 className="pb-4 text-lg font-medium">User Management</h2>
            
            <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold hidden sm:table-cell">No.</th>
                            <th scope="col" className="px-6 py-4 font-semibold">User Info</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Joined Date</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4 hidden sm:table-cell font-medium text-gray-900">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0 font-bold overflow-hidden">
                                        <img src={assets.profile_icon} className="w-full object-cover opacity-50"/>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 line-clamp-1">{user.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{user.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 min-w-[120px]">
                                    {user.createdAt 
                                        ? new Date(user.createdAt).toLocaleDateString("vi-VN") 
                                        : "N/A"
                                    }
                                </td>
                                <td className="px-6 py-4">
                                     {user.isDeleted ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Locked
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-medium">
                                    <button
                                        onClick={() => toggleDeleteUser(user._id, user.isDeleted)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                            user.isDeleted 
                                                ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50" 
                                                : "bg-white text-red-600 border-red-200 hover:bg-red-50"
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
                    <div className="text-center py-10 text-gray-500">
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
};

export default Users;
