import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import "../Modal.css";
import { useDropzone } from "react-dropzone";

Modal.setAppElement("#root");

function RejectionModal({ isOpen, onRequestClose, ticketId }) {
    const [details, setDetails] = useState([]);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [emailTemplate, setEmailTemplate] = useState("");

    const onDrop = (acceptedFiles) => {
        setFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const fetchEmailTemplate = async (ticketId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/getRejectionEmailTemplate/${ticketId}`,
                { withCredentials: true }
            );
            setEmailTemplate(response.data.emailTemplate);
        } catch (error) {
            console.error("Error fetching email template:", error);
        }
    };

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/getTicketDetails/${ticketId}`
                );
                const ticketDetails = response.data;

                const initialFormData = {};
                ticketDetails.details.forEach((detail) => {
                    initialFormData[detail.detail_name] = detail.value;
                });

                setDetails(ticketDetails.details);
                setFormData(initialFormData);
                setEmailTemplate(generateEmailTemplate(ticketDetails.details, initialFormData));
            } catch (error) {
                console.error("Error fetching ticket details:", error);
            }
        };

        if (isOpen && ticketId) {
            fetchTicketDetails();
            fetchEmailTemplate(ticketId);
        }
    }, [isOpen, ticketId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        setEmailTemplate(generateEmailTemplate(details, {
            ...formData,
            [name]: value,
        }));
    };

    const generateEmailTemplate = (details, formData) => {
        let body = `Dear Client,\n\n`;
        body += `Your ticket has been updated with the following details:\n\n`;

        details.forEach((detail) => {
            body += `${detail.detail_name}: ${formData[detail.detail_name] || detail.value}\n`;
        });

        body += "\nIf you agree with the new details, please reply to this email. Else, please reply to this email whether you would like to suggest new details or cancel the Bantu 1-to-1 subscription.\n\n";
        body += "Thank you,\nIMCC Admin";
        
        return body;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedDetails = details.map((detail) => ({
            detail_name: detail.detail_name,
            value: formData[detail.detail_name] || detail.value,
        }));

        const formDataObj = new FormData();
        formDataObj.append("details", JSON.stringify(updatedDetails));
        formDataObj.append("emailTemplate", emailTemplate);

        if (file) {
            formDataObj.append("file", file);
        }

        try {
            const response = await axios.put(
                `http://localhost:5000/rejectTicket/${ticketId}`,
                formDataObj,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
            console.log("Ticket details updated successfully:", response.data);
            setFormData({});
            onRequestClose();
        } catch (error) {
            console.error("Error updating ticket details:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal"
        >
            <h3>Admin Counteroffer Form</h3>
            <form onSubmit={handleSubmit}>
                {details.map((detail) => (
                    <div className="detail-row" key={detail.detail_name}>
                        <label>{detail.detail_name}: </label>
                        <input
                            type={
                                detail.detail_type === "text"
                                    ? "text"
                                    : detail.detail_type
                            }
                            name={detail.detail_name}
                            value={formData[detail.detail_name] || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <label>
                    <b>Client Email Template:</b>
                </label>
                <textarea
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    rows={10}
                    style={{ width: "100%" }}
                />
                <div className="file-upload">
                    <div {...getRootProps({ className: "dropzone" })}>
                        <input {...getInputProps()} />
                        {file ? (
                            <p>{file.name}</p>
                        ) : (
                            <p>
                                Drag & drop a file here, or click to select one.
                                This file will be attached in the Client Email
                                Template.
                            </p>
                        )}
                    </div>
                </div>
                <button type="submit">Submit Counteroffer</button>
                <button type="button" onClick={onRequestClose}>
                    Cancel
                </button>
            </form>
        </Modal>
    );
}

export default RejectionModal;