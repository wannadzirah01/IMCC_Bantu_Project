// EditProfile.js
import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../EditProfile.css";

const EditProfile = () => {
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        // Add other fields you want to edit
    });
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const resp = await axios.get("http://localhost:5000/@me");
                setUserData(resp.data);
                setFormData({
                    name: resp.data.name,
                    phone_number: resp.data.phone_number,
                    // Initialize other fields
                });
            } catch (error) {
                console.log("Not authenticated");
            }
        }

        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put("http://localhost:5000/updateProfile", formData, {
                withCredentials: true,
            });
            navigate("/user"); // Redirect back to the profile page
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone_number">Phone Number:</label>
                    <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />
                </div>
                {/* Add other form fields as needed */}
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;
