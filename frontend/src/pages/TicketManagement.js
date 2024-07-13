import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import "../TicketManagement.css";
import AdminCounterofferModal from "../components/AdminCounterofferModal";

Modal.setAppElement("#root");

const TicketManagement = (props) => {
    const [tickets, setTickets] = useState([]);
    const [totalTickets, setTotalTickets] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, [page, limit, statusFilter]);

    const fetchTickets = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/getAllTickets",
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

    const handleApproval = async (ticketId) => {
        try {
            await axios.post(
                `http://localhost:5000/approveTicket/${ticketId}`,
                {
                    action: "approve",
                },
                {
                    withCredentials: true,
                }
            );
            fetchTickets(); // Refresh tickets after action
        } catch (error) {
            console.error("Error approving ticket:", error);
        }
    };

    const handleRejection = (ticketId) => {
        setSelectedTicketId(ticketId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedTicketId(null);
        setIsModalOpen(false);
    };

    const handleViewFile = (filename) => {
        const fileUrl = `http://localhost:5000/uploads/${filename}`;
        window.open(fileUrl, "_blank");
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
                        <th>Status</th>
                        <th>Package</th>
                        <th>Client Name</th>
                        <th>Created Date</th>
                        <th>Client Email</th>
                        <th>Receipt</th>
                        <th>Details</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.ticket_id}>
                            <td>{ticket.ticket_status}</td>
                            <td>{ticket.package}</td>
                            <td>{ticket.user_name}</td>
                            <td>{ticket.created_datetime}</td>
                            <td>{ticket.email}</td>
                            <td>
                                <button
                                    onClick={() =>
                                        handleViewFile(ticket.file_name)
                                    }
                                    style={{
                                        color: "blue",
                                        textDecoration: "underline",
                                        cursor: "pointer",
                                    }}
                                >
                                    View Receipt
                                </button>
                            </td>
                            <td>
                                {ticket.details.map((detail) => (
                                    <div key={detail.detail_name}>
                                        <strong>{detail.detail_name}:</strong>{" "}
                                        {detail.value}
                                    </div>
                                ))}
                            </td>
                            <td className="actions">
                                <button
                                    className={`approve ${
                                        ticket.ticket_status !==
                                        "Pending Approval"
                                            ? "disabled"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleApproval(ticket.ticket_id)
                                    }
                                    disabled={
                                        ticket.ticket_status !==
                                        "Pending Approval"
                                    }
                                >
                                    Approve
                                </button>
                                <button
                                    className={`reject ${
                                        ticket.ticket_status !==
                                        "Pending Approval"
                                            ? "disabled"
                                            : ""
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <p>Total Tickets: {totalTickets}</p>
            </div>
            {isModalOpen && (
                <AdminCounterofferModal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    ticketId={selectedTicketId}
                />
            )}
        </div>
    );
};

export default TicketManagement;
