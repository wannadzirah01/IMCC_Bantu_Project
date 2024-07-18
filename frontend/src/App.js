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
// import MatchingListing from "./pages/MatchingListing";

const App = () => {
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/getUserRole",
                    { withCredentials: true }
                );
                setUserRole(response.data.role);
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };

        fetchUserRole();
    }, []);

    return (
        <div className="App">
            <BrowserRouter>
                <NavBar userRole={userRole} setUserRole={setUserRole} />
                <Routes>
                    <Route
                        path="/"
                        element={<Login setUserRole={setUserRole} />}
                    />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/packageListing"
                        element={<PackageListing />}
                    />
                    <Route path="/matching" element={<Matching />} />
                    <Route
                        path="/ticketManagement"
                        element={<TicketManagement />}
                    />
                    <Route path="/user" element={<User />} />
                    {/* <Route path="/matchingListing" element={<MatchingListing />} /> */}
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
