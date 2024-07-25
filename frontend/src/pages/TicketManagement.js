import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "../TicketManagement.css";
import RejectionModal from "../components/RejectionModal";
import ApprovalModal from "../components/ApprovalModal";
import CompleteModal from "../components/CompleteModal";
import EditTicketModal from "../components/EditModal";
import EditModal from "../components/EditModal";
import TicketActivationModal from "../components/TicketActivationModal";

Modal.setAppElement("#root");

const TicketManagement = (props) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [tickets, setTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isTicketActivationModalOpen, setIsTicketActivationModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, [page, limit, statusFilter]);

    const fetchTickets = async () => {
        try {
            const response = await axios.get(
                `${apiUrl}/getAllTickets`,
                {
                    withCredentials: true,
                    params: {
                        page: page,
                        limit: limit,
                        status: statusFilter,
                    },
                }
            );
            setTickets(response.data.ticket_list);
            setTotalTickets(response.data.total_tickets);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const handleApproval = (ticketId) => {
        setSelectedTicketId(ticketId);
        setIsApprovalModalOpen(true);
    };

    // const handleApprovalSubmit = async (ticketId, emailTemplate, file) => {
    //     const confirmApproval = window.confirm(
    //         "Are you sure you want to approve this ticket?"
    //     );
    //     if (confirmApproval) {
    //         const formData = new FormData();
    //         formData.append("emailMessage", emailTemplate);
    //         if (file) {
    //             formData.append("file", file);
    //         }
    //         try {
    //             await axios.post(
    //                 `http://localhost:5000/approveTicket/${ticketId}`,
    //                 formData,
    //                 {
    //                     withCredentials: true,
    //                     headers: {
    //                         "Content-Type": "multipart/form-data",
    //                     },
    //                 }
    //             );
    //             fetchTickets();
    //             setIsApprovalModalOpen(false);
    //         } catch (error) {
    //             console.error("Error approving ticket:", error);
    //         }
    //     }
    // };

    const handleApprovalSubmit = async (
        ticketId,
        emailTemplate,
        file,
        updatedDetails
    ) => {
        const confirmApproval = window.confirm(
            "Are you sure you want to approve this ticket?"
        );
        if (confirmApproval) {
            const formData = new FormData();
            formData.append("emailMessage", emailTemplate);
            if (file) {
                formData.append("file", file);
            }
            if (updatedDetails) {
                formData.append(
                    "updatedDetails",
                    JSON.stringify(updatedDetails)
                );
            }
            try {
                await axios.post(
                    `${apiUrl}/approveTicket/${ticketId}`,
                    formData,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                fetchTickets();
                setIsApprovalModalOpen(false);
            } catch (error) {
                console.error("Error approving ticket:", error);
            }
        }
    };

    const handleRejection = (ticketId) => {
        setSelectedTicketId(ticketId);
        setIsModalOpen(true);
    };

    // const handleEdit = (ticketId) => {
    //     setSelectedTicketId(ticketId);
    //     setIsEditModalOpen(true);
    // };

    const handleEditSubmit = async (ticketId, details) => {
        const confirmEdit = window.confirm(
            "Are you sure you want to save these changes?"
        );
        if (confirmEdit) {
            try {
                await axios.post(
                    `${apiUrl}/updateTicket/${ticketId}`,
                    { details },
                    {
                        withCredentials: true,
                    }
                );
                fetchTickets();
                setIsEditModalOpen(false);
            } catch (error) {
                console.error("Error editing ticket:", error);
            }
        }
    };

    const closeModal = () => {
        setSelectedTicketId(null);
        setIsModalOpen(false);
        fetchTickets();
    };

    const closeEditModal = () => {
        setSelectedTicketId(null);
        setIsEditModalOpen(false);
        fetchTickets();
    };

    const handleCompletion = (ticketId) => {
        setSelectedTicketId(ticketId);
        setIsCompleteModalOpen(true);
    };

    const handleCompletionSubmit = async (ticketId, emailTemplate, file) => {
        const confirmCompletion = window.confirm(
            "Are you sure you want to set the status of this ticket to Complete?"
        );
        if (confirmCompletion) {
            const formData = new FormData();
            formData.append("emailMessage", emailTemplate);
            if (file) {
                formData.append("file", file);
            }
            try {
                await axios.post(
                    `${apiUrl}/completeTicket/${ticketId}`,
                    formData,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                fetchTickets();
                setIsCompleteModalOpen(false);
            } catch (error) {
                console.error("Error approving ticket:", error);
            }
        }
    };

    // const handleActivate = async (ticketId) => {
    //     const confirmActivation = window.confirm(
    //         "Are you sure you want to activate this ticket?"
    //     );
    //     if (confirmActivation) {
    //         try {
    //             await axios.post(
    //                 `${apiUrl}/activateTicket/${ticketId}`,
    //                 {},
    //                 {
    //                     withCredentials: true,
    //                 }
    //             );
    //             fetchTickets(); // Refresh the ticket list
    //         } catch (error) {
    //             console.error("Error activating ticket:", error);
    //         }
    //     }
    // };

    const handleTicketActivationSubmit = async (ticketId, emailTemplate, file) => {
        const confirmCompletion = window.confirm(
            "Are you sure you want to set the status of this ticket to Active?"
        );
        if (confirmCompletion) {
            const formData = new FormData();
            formData.append("emailMessage", emailTemplate);
            if (file) {
                formData.append("file", file);
            }
            try {
                await axios.post(
                    `${apiUrl}/activateTicket/${ticketId}`,
                    formData,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                fetchTickets();
                setIsTicketActivationModalOpen(false);
            } catch (error) {
                console.error("Error approving ticket:", error);
            }
        }
    };

    const handleActivate = (ticketId) => {
        setSelectedTicketId(ticketId);
        setIsTicketActivationModalOpen(true);
    };

    const handleCancel = async (ticketId) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this ticket?"
        );
        if (confirmCancel) {
            try {
                await axios.post(
                    `${apiUrl}/cancelTicket/${ticketId}`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                fetchTickets();
            } catch (error) {
                console.error("Error cancelling ticket:", error);
            }
        }
    };

    return (
        <div className="table-container">
            <h1>Ticket List</h1>
            <div>
                <label>Status Filter: </label>
                <select
                    onChange={(e) => setStatusFilter(e.target.value)}
                    value={statusFilter}
                >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div>
                <label>Page: </label>
                <input
                    type="number"
                    value={page}
                    onChange={(e) => setPage(e.target.value)}
                />
            </div>
            <div>
                <label>Limit: </label>
                <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Package</th>
                        <th>Client Name</th>
                        <th>Client Email</th>
                        <th>Client Info</th>
                        <th>Details</th>
                        <th>Created Date</th>
                        <th>Updated Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.ticket_id}>
                            <td>{ticket.ticket_id}</td>
                            <td>{ticket.package}</td>
                            <td>{ticket.user_name}</td>
                            <td>{ticket.user_email}</td>
                            <td>
                                {Object.entries(ticket.client_details).map(
                                    ([key, value]) => (
                                        <div key={key}>
                                            <strong>
                                                {key
                                                    .replace(/_/g, " ")
                                                    .toUpperCase()}
                                                :
                                            </strong>{" "}
                                            {value}
                                        </div>
                                    )
                                )}
                            </td>
                            <td>
                                {ticket.details.map((detail) => (
                                    <div key={detail.detail_name}>
                                        <strong>{detail.detail_name}:</strong>{" "}
                                        {detail.value}
                                    </div>
                                ))}
                            </td>
                            <td>{ticket.created_datetime}</td>
                            <td>{ticket.updated_datetime}</td>
                            <td>{ticket.ticket_status}</td>
                            <td className="actions">
                                <div className="actions-container">
                                    <button
                                        className={`approve ${
                                            ticket.ticket_status ===
                                                "Pending Approval" ||
                                            ticket.ticket_status ===
                                                "Pending Client Response"
                                                ? ""
                                                : "disabled"
                                        }`}
                                        onClick={() =>
                                            handleApproval(ticket.ticket_id)
                                        }
                                        disabled={
                                            ticket.ticket_status !==
                                                "Pending Approval" &&
                                            ticket.ticket_status !==
                                                "Pending Client Response"
                                        }
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className={`activate ${
                                            ticket.ticket_status ===
                                            "Pending Payment"
                                                ? ""
                                                : "disabled"
                                        }`}
                                        onClick={() =>
                                            handleActivate(ticket.ticket_id)
                                        }
                                        disabled={
                                            ticket.ticket_status !==
                                            "Pending Payment"
                                        }
                                    >
                                        Activate
                                    </button>

                                    <button
                                        className={`reject ${
                                            ticket.ticket_status ===
                                            "Pending Approval"
                                                ? ""
                                                : "disabled"
                                        }`}
                                        onClick={() =>
                                            handleRejection(ticket.ticket_id)
                                        }
                                        disabled={
                                            ticket.ticket_status !==
                                            "Pending Approval"
                                        }
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className={`complete ${
                                            ticket.ticket_status === "Active"
                                                ? ""
                                                : "disabled"
                                        }`}
                                        onClick={() =>
                                            handleCompletion(ticket.ticket_id)
                                        }
                                        disabled={
                                            ticket.ticket_status !== "Active"
                                        }
                                    >
                                        Complete
                                    </button>
                                    <button
                                        className={`cancel ${
                                            ticket.ticket_status ===
                                                "Pending Approval" ||
                                            ticket.ticket_status ===
                                                "Pending Client Response"
                                                ? ""
                                                : "disabled"
                                        }`}
                                        onClick={() =>
                                            handleCancel(ticket.ticket_id)
                                        }
                                        disabled={
                                            ticket.ticket_status !==
                                                "Pending Approval" &&
                                            ticket.ticket_status !==
                                                "Pending Client Response"
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <p>Total Tickets: {totalTickets}</p>
            </div>
            {isModalOpen && (
                <RejectionModal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    ticketId={selectedTicketId}
                />
            )}
            {isApprovalModalOpen && (
                <ApprovalModal
                    isOpen={isApprovalModalOpen}
                    onRequestClose={() => setIsApprovalModalOpen(false)}
                    ticketId={selectedTicketId}
                    onSubmit={handleApprovalSubmit}
                />
            )}
            {isCompleteModalOpen && (
                <CompleteModal
                    isOpen={isCompleteModalOpen}
                    onRequestClose={() => setIsCompleteModalOpen(false)}
                    ticketId={selectedTicketId}
                    onSubmit={handleCompletionSubmit}
                />
            )}
            {isTicketActivationModalOpen && (
                <TicketActivationModal
                    isOpen={isTicketActivationModalOpen}
                    onRequestClose={() => setIsTicketActivationModalOpen(false)}
                    ticketId={selectedTicketId}
                    onSubmit={handleTicketActivationSubmit}
                />
            )}
        </div>
    );
};

export default TicketManagement;
