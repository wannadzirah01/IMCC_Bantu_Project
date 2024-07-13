import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import "../Modal.css";

Modal.setAppElement("#root");

function AdminCounterofferModal({ isOpen, onRequestClose, ticketId }) {
    const [details, setDetails] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/getTicketDetails/${ticketId}`
                );
                const ticketDetails = response.data;

                // Extract details from response and initialize formData state
                const initialFormData = {};
                ticketDetails.details.forEach(detail => {
                    initialFormData[detail.detail_name] = detail.value;
                });

                setDetails(ticketDetails.details);
                setFormData(initialFormData);
            } catch (error) {
                console.error("Error fetching ticket details:", error);
            }
        };

        if (isOpen && ticketId) {
            fetchTicketDetails();
        }
    }, [isOpen, ticketId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare the updated details
        const updatedDetails = details.map(detail => ({
            detail_name: detail.detail_name,
            value: formData[detail.detail_name] || detail.value
        }));

        try {
            const response = await axios.put(
                `http://localhost:5000/rejectTicket/${ticketId}`,
                { details: updatedDetails }
            );
            console.log("Ticket details updated successfully:", response.data);
            // Reset form fields
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
                            type="text"
                            name={detail.detail_name}
                            value={formData[detail.detail_name] || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <button type="submit">Submit Counteroffer</button>
                <button type="button" onClick={onRequestClose}>
                    Cancel
                </button>
            </form>
        </Modal>
    );
}

export default AdminCounterofferModal;
