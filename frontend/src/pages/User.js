import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const User = () => {
    const [userData, setUserData] = useState(null);
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

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const resp = await axios.get("http://localhost:5000/@me");
                setUserData(resp.data);
            } catch (error) {
                console.log("Not authenticated");
            }
        }

        fetchUserProfile();
    }, []);

    return userData ? (
        <div className="profile-container">
            <div className="profile-user-info">
                <h2>User Profile</h2>
                <p>
                    <strong>Email:</strong> {userData.email}
                </p>
                <p>
                    <strong>Name:</strong> {userData.name}
                </p>
                <p>
                    <strong>Phone Number:</strong> {userData.phone_number}
                </p>
                {userRole === "mentor" && (
                    <>
                        <p>
                            <strong>Matric Number:</strong>{" "}
                            {userData.matric_number}
                        </p>
                        <p>
                            <strong>School:</strong> {userData.school}
                        </p>
                        <p>
                            <strong>Gender:</strong> {userData.gender}
                        </p>
                        <p>
                            <strong>Country:</strong> {userData.country}
                        </p>
                        <p>
                            <strong>1st Language:</strong> {userData.language1}
                        </p>
                        <p>
                            <strong>2nd Language:</strong> {userData.language2}
                        </p>
                    </>
                )}
            </div>
        </div>
    ) : (
        "You need to log in to view this content."
    );
};

export default User;
