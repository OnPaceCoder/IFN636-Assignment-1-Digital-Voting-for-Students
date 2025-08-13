import React, { useEffect, useMemo, useState } from "react";

const EditCandidateForm = ({ initialValues, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        position: "",
        manifesto: "",
        photoUrl: "",
        status: "active",
    });

    useEffect(() => {
        if (initialValues) {
            setFormData({
                name: initialValues.name || "",
                position: initialValues.position || "",
                manifesto: initialValues.manifesto || "",
                photoUrl: initialValues.photoUrl || "",
                status: initialValues.status || "active",
            });
        }
    }, [initialValues]);

    // Sending fields that actually changed
    const changedPayload = useMemo(() => {
        if (!initialValues) return formData;
        const diff = {};
        for (const key of Object.keys(formData)) {
            if (formData[key] !== (initialValues[key] ?? "")) diff[key] = formData[key];
        }
        return diff;
    }, [formData, initialValues]);

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(changedPayload);
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Enter candidate name"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Position</label>
                    <input
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="e.g. President"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Manifesto</label>
                    <textarea
                        name="manifesto"
                        value={formData.manifesto}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Candidate's vision/plan"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Photo URL</label>
                    <input
                        name="photoUrl"
                        value={formData.photoUrl}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Link to candidate photo"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    >
                        <option value="active">Active</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditCandidateForm;
