import React, { useState } from "react";
import axios from "../api/axios";
import "../ChangePassword.css";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match");
            return;
        }
        try {
            const response = await axios.post(
                "http://localhost:5000/changePassword",
                { currentPassword, newPassword },
                { withCredentials: true }
            );
            alert("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigate("/user")
        } catch (err) {
            if (err.response && err.response.status === 401) {
                alert("Invalid current password");
            } else {
                alert("An error occurred while changing the password");
            }
        }
    };

    return (
        <div className="change-password-page">
            <div className="auth-form-container">
                <form className="change-password-form" onSubmit={handleSubmit}>
                    <h2>Change Password</h2>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            type="password"
                            placeholder="Enter current password"
                            id="currentPassword"
                            name="currentPassword"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type="password"
                            placeholder="Enter new password"
                            id="newPassword"
                            name="newPassword"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            placeholder="Confirm new password"
                            id="confirmPassword"
                            name="confirmPassword"
                        />
                    </div>
                    <div className="button-container">
                        <button type="submit">Change Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
