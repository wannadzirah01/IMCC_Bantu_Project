import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../App.css";

const Login = ({ fetchUserDetails }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5000/login",
                { email, password },
                { withCredentials: true }
            );
            alert("Successful user login");

            const userRoleResponse = await axios.get(
                "http://localhost:5000/getUserDetails",
                { withCredentials: true }
            );
            fetchUserDetails(userRoleResponse.data.role);

            if (userRoleResponse.data.role === "admin") {
                navigate("/ticketManagement");
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                alert("Invalid Credentials");
            }
        }
    };

    return (
        <div className="login-page">
            <div className="auth-form-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h3>Log In</h3>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Please enter your email"
                            id="email"
                            name="email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Please enter your password"
                            id="password"
                            name="password"
                        />
                    </div>
                    <div className="button-container">
                        <button type="submit">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
