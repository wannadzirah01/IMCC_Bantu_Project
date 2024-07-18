import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import "../App.css";
import "../RegisterAdmin.css";

const RegisterAdmin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get("http://localhost:5000/getAdmins", {
                withCredentials: true,
            });
            setAdmins(response.data);
        } catch (err) {
            console.error("Error fetching admins:", err);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5000/register",
                { email, password, name, phoneNumber },
                { withCredentials: true }
            );
            alert("Admin registered successfully");

            // Clear the form
            setEmail("");
            setPassword("");
            setName("");
            setPhoneNumber("");

            // Refresh the list of admins
            fetchAdmins();
        } catch (err) {
            console.error("Error registering admin:", err);
            alert("Error registering admin");
        }
    };

    return (
        <div className="register-page">
            <div className="auth-form-container">
                <form className="register-form" onSubmit={handleSubmit}>
                    <h2>Register New Admin</h2>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Please enter the email"
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
                            placeholder="Please enter the password"
                            id="password"
                            name="password"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            placeholder="Please enter the name"
                            id="name"
                            name="name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            type="text"
                            placeholder="Please enter the phone number"
                            id="phoneNumber"
                            name="phoneNumber"
                        />
                    </div>
                    <div className="button-container">
                        <button type="submit">Register</button>
                    </div>
                </form>
            </div>

            <div className="admin-list">
                <h2>List of Admins</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id}>
                                <td>{admin.name}</td>
                                <td>{admin.email}</td>
                                <td>{admin.phone_number}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegisterAdmin;
