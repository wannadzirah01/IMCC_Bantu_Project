// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "../TicketManagement.css";

// const MatchingListing = (props) => {
//     const [matches, setMatches] = useState([]);
//     const [totalMatches, setTotalMatches] = useState(0);
//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(10);
//     const navigate = useNavigate();

//     useEffect(() => {
//         fetchMatches();
//     }, [page, limit]);

//     const fetchMatches = async () => {
//         try {
//             const response = await axios.get(
//                 "http://localhost:5000/getMatches",
//                 {
//                     withCredentials: true,
//                     params: {
//                         page: page,
//                         limit: limit,
//                     },
//                 }
//             );
//             setMatches(response.data);
//             setTotalMatches(response.data.length);
//         } catch (error) {
//             console.error("Error fetching matches:", error);
//         }
//     };

//     const handleStatusChange = async (matchingId, newStatus) => {
//         try {
//             await axios.put(
//                 `http://localhost:5000/updateMatchStatus/${matchingId}`,
//                 {
//                     status: newStatus,
//                 },
//                 { withCredentials: true }
//             );
//             fetchMatches(); // Refresh the match list after updating status
//         } catch (error) {
//             console.error("Error updating status:", error);
//         }
//     };

//     return (
//         <div className="table-container">
//             <div className="header">
//                 <h1>Matching List</h1>
//                 <button
//                     className="navigate-button"
//                     onClick={() => navigate("/matching")}
//                 >
//                     Assign Mentor
//                 </button>
//             </div>
//             <div>
//                 <label>Page: </label>
//                 <input
//                     type="number"
//                     value={page}
//                     onChange={(e) => setPage(e.target.value)}
//                 />
//             </div>
//             <div>
//                 <label>Limit: </label>
//                 <input
//                     type="number"
//                     value={limit}
//                     onChange={(e) => setLimit(e.target.value)}
//                 />
//             </div>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Ticket ID</th>
//                         <th>Client Name</th>
//                         <th>Client Matric Number</th>
//                         <th>Mentor Name</th>
//                         <th>Mentor Matric Number</th>
//                         <th>Matching Date</th>
//                         <th>Status</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {matches.map((match) => (
//                         <tr key={match.matching_id}>
//                             <td>{match.ticket_id}</td>
//                             <td>{match.client_name}</td>
//                             <td>{match.client_matric_num}</td>
//                             <td>{match.mentor_name}</td>
//                             <td>{match.mentor_matric_num}</td>
//                             <td>
//                                 {new Date(match.matching_date).toLocaleString()}
//                             </td>
//                             <td>
//                                 <select
//                                     value={match.status}
//                                     onChange={(e) =>
//                                         handleStatusChange(
//                                             match.matching_id,
//                                             e.target.value
//                                         )
//                                     }
//                                 >
//                                     <option value="active">Active</option>
//                                     <option value="completed">Completed</option>
//                                 </select>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//             <div>
//                 <p>Total Matches: {totalMatches}</p>
//             </div>
//         </div>
//     );
// };

// export default MatchingListing;
