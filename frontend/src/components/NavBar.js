import { Link, useMatch, useResolvedPath, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../Style.css";

function NavBar({ userRole, setUserRole, userEmail, setUserEmail }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:5000/logout",
                {},
                { withCredentials: true }
            );
            setUserEmail("")
            setUserRole("");
            navigate("/");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <nav className="nav">
            <Link className="site-title">
                <img
                    src="./USM_LOGO.png"
                    alt="USM Logo"
                    width={100}
                    height={36}
                />
                <img
                    src="./IMCC_LOGO.png"
                    alt="IMCC Logo"
                    width={100}
                    height={36}
                />
                IMCC Bantu: 1 to 1
            </Link>
            <ul>
                {/* Conditionally render the Bantu 1-to-1 Package link */}
                {!userRole && (
                    <CustomLink to="/packageListing">
                        Bantu 1-to-1 Package
                    </CustomLink>
                )}
                {userRole && (
                    <>
                        <CustomLink to="/user">User</CustomLink>
                        <CustomLink to="/ticketManagement">
                            Ticket Management
                        </CustomLink>
                        {userEmail === "imccbantu@usm.my" && (
                            <CustomLink to="/registerAdmin">
                                Admin Management
                            </CustomLink>
                        )}
                        {/* <CustomLink to="/matchingListing">Mentor Management</CustomLink> */}
                    </>
                )}
                {userRole ? (
                    <div className="button-general-logout">
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <div className="link">
                        <Link to="/">Login for Admin</Link>
                    </div>
                )}
            </ul>
        </nav>
    );
}

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });
    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    );
}

export default NavBar;
