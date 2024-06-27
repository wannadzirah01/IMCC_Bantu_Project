import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import "../Modal.css";

Modal.setAppElement("#root");

function PackageFormModal({ isOpen, onRequestClose, packageId }) {
    const [details, setDetails] = useState([]);
    const [formData, setFormData] = useState({});
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNum, setPhoneNum] = useState("");
    const [gender, setGender] = useState("");
    const [country, setCountry] = useState("");
    const [language1, setLanguage1] = useState("");
    const [language2, setLanguage2] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchPackageDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/getPackageDetails/${packageId}`
                );
                setDetails(response.data.package_details);
                setFormData(
                    response.data.package_details.reduce((acc, detail) => {
                        acc[detail.detail_name] = "";
                        return acc;
                    }, {})
                );
            } catch (error) {
                console.error("Error fetching package details:", error);
            }
        };

        if (packageId) {
            fetchPackageDetails();
        }
    }, [packageId]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "name") {
            setName(value);
        } else if (name === "email") {
            setEmail(value);
        } else if (name === "file") {
            setFile(files[0]);
        } else if (name === "phoneNum") {
            setPhoneNum(value);
        } else if (name === "gender") {
            setGender(value);
        } else if (name === "country") {
            setCountry(value);
        } else if (name === "language1") {
            setLanguage1(value);
        } else if (name === "language2") {
            setLanguage2(value);
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Prepare formData to send to backend (including name, email, file, and package details)
        const formDataToSend = new FormData();
        formDataToSend.append("name", name);
        formDataToSend.append("email", email);
        formDataToSend.append("phone_num", phoneNum);
        formDataToSend.append("file", file);
        formDataToSend.append("package_id", packageId);
        formDataToSend.append("gender", gender); // Add gender
        formDataToSend.append("country", country); // Add country
        formDataToSend.append("language1", language1); // Add language1
        formDataToSend.append("language2", language2); // Add language2
        Object.entries(formData).forEach(([key, value]) => {
            formDataToSend.append(key, value);
        });

        try {
            const response = await axios.post(
                "http://localhost:5000/createNewTicket",
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true, // Include withCredentials here
                }
            );
            console.log("Form submitted successfully:", response.data);
            // Reset all form fields
            setName("");
            setEmail("");
            setPhoneNum("");
            setGender("");
            setCountry("");
            setLanguage1("");
            setLanguage2("");
            setFile(null);
            setFormData({});
            onRequestClose();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal"
        >
            <h3>Package Details Form</h3>
            <form onSubmit={handleSubmit}>
                <div className="detail-row">
                    <label>Client Name: </label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="detail-row">
                    <label>Client Phone Number: </label>
                    <input
                        type="text"
                        name="phoneNum"
                        value={phoneNum}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="detail-row">
                    <label>Client Email: </label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                    />
                </div>
                {[1, 4, 5, 6].includes(packageId) && (
                    <>
                        <div className="detail-row">
                            <label>Gender: </label>
                            <select
                                name="gender"
                                value={gender} // Use gender state
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select gender
                                </option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="detail-row">
                            <label>Country: </label>
                            <input
                                type="text"
                                name="country"
                                value={country}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="detail-row">
                            <label>Language 1: </label>
                            <input
                                type="text"
                                name="language1"
                                value={language1}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="detail-row">
                            <label>Language 2: </label>
                            <input
                                type="text"
                                name="language2"
                                value={language2}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                )}
                <div className="detail-row">
                    <label>Upload File: </label>
                    <input
                        type="file"
                        name="file"
                        onChange={handleChange}
                        required
                    />
                </div>
                {details.map((detail) => (
                    <div className="detail-row" key={detail.detail_name}>
                        <label>{detail.detail_name}: </label>
                        <input
                            type={detail.detail_type}
                            name={detail.detail_name}
                            value={formData[detail.detail_name]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <button type="submit">Submit</button>
                <button type="button" onClick={onRequestClose}>
                    Cancel
                </button>
            </form>
        </Modal>
    );
}

export default PackageFormModal;
