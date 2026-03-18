import React, { useState } from "react";
import { assets } from "../../assets/assets.js";
import { useAppContext } from "../../context/AppContext.jsx";
import toast from "react-hot-toast";

function Categories() {
  const { categories, fetchCategories, axios } = useAppContext();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      if (!name || !image) {
        return toast.error("Please provide both name and image");
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);

      const { data } = await axios.post("/api/category/add", formData);
      if (data.success) {
        toast.success(data.message);
        setName("");
        setImage(null);
        fetchCategories(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeCategory = async (id) => {
    try {
      const { data } = await axios.post("/api/category/remove", { id });
      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col">
      <div className="w-full md:p-10 p-4">
        {/* ADD CATEGORY FORM */}
        <h2 className="pb-4 text-lg font-medium">Add Category</h2>
        <form
          onSubmit={onSubmitHandler}
          className="space-y-5 max-w-lg mb-10 bg-white p-6 rounded-md border border-gray-500/20"
        >
          <div>
            <p className="text-base font-medium mb-2">Category Image</p>
            <label htmlFor="category-image">
              <input
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
                type="file"
                id="category-image"
                hidden
              />
              <img
                className="max-w-24 cursor-pointer rounded border border-gray-300"
                src={image ? URL.createObjectURL(image) : assets.upload_area}
                alt="uploadArea"
                width={100}
                height={100}
              />
            </label>
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="category-name">
              Category Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              id="category-name"
              type="text"
              placeholder="e.g. Mobile Phones"
              className="outline-none py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
          <button className="px-8 py-2.5 bg-primary-dull text-white font-medium rounded cursor-pointer">
            ADD CATEGORY
          </button>
        </form>

        {/* LIST CATEGORIES */}
        <h2 className="pb-4 text-lg font-medium">All Categories</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-auto w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold w-24">Image</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {categories.map((cat) => (
                <tr key={cat._id} className="border-t border-gray-500/20">
                  <td className="px-4 py-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 object-cover rounded border border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeCategory(cat._id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-4 py-4 text-center">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Categories;
