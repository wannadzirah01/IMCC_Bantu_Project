import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "../Modal.css";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const ApprovalModal = ({ isOpen, onRequestClose, ticketId, onSubmit }) => {
    const [file, setFile] = useState(null);
    const [emailTemplate, setEmailTemplate] = useState("");
    const [editDetails, setEditDetails] = useState(false);
    const [ticketDetails, setTicketDetails] = useState([]);

    const onDrop = (acceptedFiles) => {
        setFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    useEffect(() => {
        if (isOpen && ticketId) {
            fetchEmailTemplate(ticketId);
            if (editDetails) {
                fetchTicketDetails(ticketId);
            }
        }
    }, [isOpen, ticketId, editDetails]);

    const fetchEmailTemplate = async (ticketId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/getEmailTemplate/${ticketId}`,
                { withCredentials: true }
            );
            setEmailTemplate(response.data.emailTemplate);
        } catch (error) {
            console.error("Error fetching email template:", error);
        }
    };

    const fetchTicketDetails = async (ticketId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/getTicketDetails/${ticketId}`,
                { withCredentials: true }
            );
            setTicketDetails(response.data.details);
        } catch (error) {
            console.error("Error fetching ticket details:", error);
        }
    };

    // const handleSubmit = () => {
    //     onSubmit(ticketId, emailTemplate, file, editDetails ? ticketDetails : null);
    // };

    const handleSubmit = () => {
        onSubmit(ticketId, emailTemplate, file, editDetails ? ticketDetails : null);
    };

    const handleDetailChange = (index, value) => {
        const newDetails = [...ticketDetails];
        newDetails[index].value = value;
        setTicketDetails(newDetails);
        setEmailTemplate(generateEmailTemplate(newDetails));
    };

    const handleEditDetailsChange = (e) => {
        setEditDetails(e.target.checked);
        if (e.target.checked) {
            setEmailTemplate(generateEmailTemplate(ticketDetails));
        } else {
            fetchEmailTemplate(ticketId);
        }
    };

    const generateEmailTemplate = (details) => {
        let body = `Dear Client,\n\n`;
        body += `Your ticket has been updated with the following details:\n\n`;

        details.forEach((detail) => {
            body += `${detail.detail_name}: ${detail.value}\n`;
        });

        body += "\nPlease reply to this email if you agree with the suggested details. Else, please reply to this email whether you would like to suggest new details or cancel the Bantu 1-to-1 subscription.\n\n";
        body += "Thank you,\nIMCC Admin";
        
        return body;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal"
        >
            <h2>Approve Ticket</h2>
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
            <div className="edit-details-container">
                <input
                    type="checkbox"
                    checked={editDetails}
                    onChange={handleEditDetailsChange}
                />
                <label>Edit Ticket Details</label>
            </div>
            {editDetails && (
                <div className="ticket-details">
                    {ticketDetails.map((detail, index) => (
                        <div key={index} className="detail">
                            <label>{detail.detail_name}:</label>
                            <input
                                type={
                                    detail.detail_type === "text"
                                        ? "text"
                                        : detail.detail_type
                                }
                                value={detail.value}
                                onChange={(e) =>
                                    handleDetailChange(index, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>
            )}
            <button type="submit" onClick={handleSubmit}>
                Submit
            </button>
            <button type="button" onClick={onRequestClose}>
                Cancel
            </button>
        </Modal>
    );
};

export default ApprovalModal;
