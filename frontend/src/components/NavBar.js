import { Link, useMatch, useResolvedPath, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import "../Style.css"

function NavBar({ userRole, setUserRole }) {

  return (
    <nav className="nav">
      <Link className="site-title">
        <img src="./USM_LOGO.png" alt="USM Logo" width={100} height={36} />
        <img src="./IMCC_LOGO.png" alt="IMCC Logo" width={100} height={36} />
        IMCC Bantu: 1 to 1
      </Link>
      <ul>
        <CustomLink to="/login">Login</CustomLink>
      </ul>
    </nav>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>{children}</Link>
    </li>
  );
}

export default NavBar;