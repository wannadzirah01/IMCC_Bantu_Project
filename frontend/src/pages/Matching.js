// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "../api/axios";
// import "../Matching.css"; // Import your CSS

// const Matching = () => {
//     const navigate = useNavigate();
//     const [clients, setClients] = useState([]);
//     const [selectedClient, setSelectedClient] = useState("");
//     const [clientDetails, setClientDetails] = useState(null);
//     const [mentors, setMentors] = useState([]);
//     const [selectedMentor, setSelectedMentor] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchClients = async () => {
//             setLoading(true);
//             try {
//                 const response = await axios.get(
//                     "http://localhost:5000/get-clients",
//                     { withCredentials: true }
//                 );
//                 setClients(response.data);
//             } catch (err) {
//                 console.error("Error fetching clients:", err);
//                 setError("Failed to load clients. Please try again later.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchClients();
//     }, []);

//     const fetchClientDetails = async (clientId) => {
//         try {
//             const response = await axios.get(
//                 `http://localhost:5000/get-client-details/${clientId}`,
//                 { withCredentials: true }
//             );
//             setClientDetails(response.data);
//         } catch (err) {
//             console.error("Error fetching client details:", err);
//             setError("Failed to load client details.");
//         }
//     };

//     const handleClientChange = (e) => {
//         const clientId = e.target.value;
//         setSelectedClient(clientId);
//         if (clientId) {
//             fetchClientDetails(clientId);
//         } else {
//             setClientDetails(null);
//         }
//     };

//     const handleFindMatches = async () => {
//         if (clientDetails) {
//             try {
//                 const response = await axios.post(
//                     "http://localhost:5000/match",
//                     clientDetails,
//                     { withCredentials: true }
//                 );
//                 setMentors(response.data);
//                 alert("List of compatible mentors successfully generated.");
//             } catch (err) {
//                 console.error("Error finding matches:", err);
//                 setError("Failed to find matches.");
//             }
//         }
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         try {
//             await axios.post("http://localhost:5000/insert-match", {
//                 client_id: selectedClient,
//                 mentor_id: selectedMentor,
//             });
//             alert("Match created successfully!");
//             navigate("/matchingListing");
//         } catch (err) {
//             if (err.response && err.response.status === 401) {
//                 alert("Details you entered are invalid! Please try again.");
//             }
//         }
//     };

//     return (
//         <div className="container mt-4">
//             <div className="d-flex justify-content-between align-items-center">
//                 <h1 className="text-center">Assign Mentor</h1>
//                 <Link to="/matchingListing">
//                     <button className="btn cancel">Cancel</button>
//                 </Link>
//             </div>
//             <p className="text-muted text-center">
//                 **Select a client's name to generate a list of compatible mentors.**
//             </p>
            
//             {loading && <div className="text-center">Loading clients...</div>}
//             {error && <div className="alert alert-danger">{error}</div>}

//             <label htmlFor="client" className="form-label">
//                 Client Name (Client Matric No.)
//             </label>
//             <select
//                 value={selectedClient}
//                 onChange={handleClientChange}
//                 className="form-select mb-3"
//             >
//                 <option value="">Select a client</option>
//                 {clients.map((client) => (
//                     <option key={client.id} value={client.id}>
//                         {client.name} ({client.matric_no})
//                     </option>
//                 ))}
//             </select>

//             {clientDetails && (
//                 <div className="client-details mb-4">
//                     <h5 className="border-bottom pb-2">Client Details:</h5>
//                     <div className="row">
//                         <div className="col">
//                             <strong>Gender:</strong> {clientDetails.gender}
//                         </div>
//                         <div className="col">
//                             <strong>Country:</strong> {clientDetails.country}
//                         </div>
//                         <div className="col">
//                             <strong>School:</strong> {clientDetails.school}
//                         </div>
//                     {/* </div>
//                     <div className="row"> */}
//                         <div className="col">
//                             <strong>Language 1:</strong>{" "}
//                             {clientDetails.language_1}
//                         </div>
//                         <div className="col">
//                             <strong>Language 2:</strong>{" "}
//                             {clientDetails.language_2}
//                         </div>
//                     </div>
//                     <div className="text-center">
//                         <button
//                             className="btn btn-primary mt-3"
//                             onClick={handleFindMatches}
//                         >
//                             Find Matches
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {mentors.length > 0 && (
//                 <div className="mentor-selection">
//                     <label htmlFor="mentor" className="form-label">
//                         Mentor Name
//                     </label>
//                     <select
//                         value={selectedMentor}
//                         onChange={(e) => setSelectedMentor(e.target.value)}
//                         className="form-select mb-4"
//                     >
//                         <option value="">Select a mentor</option>
//                         {mentors.map((mentor) => (
//                             <option key={mentor.id} value={mentor.id}>
//                                 {mentor.name} (Similarity:{" "}
//                                 {mentor.Similarity.toFixed(2)}%)
//                             </option>
//                         ))}
//                     </select>

//                     <div className="mentor-details">
//                         <h5 className="mb-4">Top 3 Compatible Mentors:</h5>
//                         <div className="row">
//                             {mentors.slice(0, 3).map((mentor) => (
//                                 <div key={mentor.id} className="col-md-4 mb-3">
//                                     <div className="card h-100">
//                                         <div className="card-body">
//                                             <h4 className="card-title">
//                                                 {mentor.name} (
//                                                 {mentor.matric_no})
//                                             </h4>
//                                             <hr />
//                                             <p className="card-text">
//                                                 <strong>Gender:</strong>{" "}
//                                                 {mentor.gender}
//                                             </p>
//                                             <p className="card-text">
//                                                 <strong>Country:</strong>{" "}
//                                                 {mentor.country}
//                                             </p>
//                                             <p className="card-text">
//                                                 <strong>School:</strong>{" "}
//                                                 {mentor.school}
//                                             </p>
//                                             <p className="card-text">
//                                                 <strong>Language 1:</strong>{" "}
//                                                 {mentor.language_1}
//                                             </p>
//                                             <p className="card-text">
//                                                 <strong>Language 2:</strong>{" "}
//                                                 {mentor.language_2}
//                                             </p>
//                                             <p className="card-text">
//                                                 <strong>Similarity:</strong>{" "}
//                                                 {mentor.Similarity.toFixed(2)}%
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {mentors.length > 0 && (
//                 <div className="row mt-4">
//                     <div className="col text-end">
//                         {selectedMentor && (
//                             <button
//                                 className="btn assign"
//                                 onClick={handleSubmit}
//                             >
//                                 Assign
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Matching;
