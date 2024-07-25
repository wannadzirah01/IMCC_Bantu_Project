import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "../Modal.css";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const TicketActivationModal = ({ isOpen, onRequestClose, ticketId, onSubmit }) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [file, setFile] = useState(null);
    const [emailTemplate, setEmailTemplate] = useState("");

    const onDrop = (acceptedFiles) => {
        setFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    useEffect(() => {
        if (isOpen && ticketId) {
            fetchEmailTemplate(ticketId);
        }
    }, [isOpen, ticketId]);

    const fetchEmailTemplate = async (ticketId) => {
        try {
            const response = await axios.get(
                `${apiUrl}/getTicketActivationEmailTemplate/${ticketId}`,
                { withCredentials: true }
            );
            setEmailTemplate(response.data.emailTemplate);
        } catch (error) {
            console.error("Error fetching email template:", error);
        }
    };


    const handleSubmit = () => {
        onSubmit(ticketId, emailTemplate, file);
    };


    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal"
        >
            <h2>Approve Payment</h2>
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
            <button type="submit" onClick={handleSubmit}>
                Submit
            </button>
            <button type="button" onClick={onRequestClose}>
                Cancel
            </button>
        </Modal>
    );
};

export default TicketActivationModal;
