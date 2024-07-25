import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "./api/axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NavBar from "./components/NavBar";
import PackageListing from "./pages/PackageListing";
import Matching from "./pages/Matching";
import TicketManagement from "./pages/TicketManagement";
import User from "./pages/User";
import RegisterAdmin from "./pages/RegisterAdmin";
import ChangePassword from "./components/ChangePassword";
import EditProfile from "./components/EditProfile";
// import MatchingListing from "./pages/MatchingListing";

const App = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [userRole, setUserRole] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(
                `${apiUrl}/getUserDetails`,
                { withCredentials: true }
            );
            setUserRole(response.data.role);
            setUserEmail(response.data.email);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };


    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <div className="App">
            <BrowserRouter>
                <NavBar userRole={userRole} setUserRole={setUserRole} userEmail={userEmail} setUserEmail={setUserEmail} />
                <Routes>
                    <Route path="/" element={<Login fetchUserDetails={fetchUserDetails} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/packageListing" element={<PackageListing />} />
                    <Route path="/matching" element={<Matching />} />
                    <Route path="/ticketManagement" element={<TicketManagement />} />
                    <Route path="/user" element={<User />} />
                    <Route path="/registerAdmin" element={<RegisterAdmin />} />
                    <Route path="/changePassword" element={<ChangePassword />} />
                    <Route path="/editProfile" element={<EditProfile />} />
                    {/* <Route path="/matchingListing" element={<MatchingListing />} /> */}
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
