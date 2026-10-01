import { Link,useLocation} from "react-router-dom";
function Navbar() {
    const location=useLocation();

    const pageTitles = {
        "/dashboard":"Dashboard",
        "/upload":"Upload Contract",
        "/analysis":"AI Analysis",
        "/history":"Contract History",
        "/profile":"My Profile"
    };

    const pageTitle=pageTitles[location.pathname] || "ContractLensAI";
    return (
        <nav className="top-navbar">

            <div className="navbar-title">
                {pageTitle}
            </div>

            <div className="navbar-right">

                <span className="welcome-text">
                        Welcome,User
                </span>

                <Link
                to="/profile"
                className="navbar-profile-btn"
                >
                    Profile
                </Link>
            </div>  
        </nav>
    );
}
export default Navbar;