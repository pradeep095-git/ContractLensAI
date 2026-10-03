import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: "⌂" },
        { path: "/upload", label: "Upload Contract", icon: "↑" },
        { path: "/analysis", label: "AI Analysis", icon: "✦" },
        { path: "/history", label: "History", icon: "↶" },
        { path: "/profile", label: "Profile", icon: "♙" }
    ];

    return (
        <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

            <div className="sidebar-header">

                <div className="sidebar-brand">
                    ContractLensAI
                </div>

                <button
                    className="sidebar-close-btn"
                    onClick={onClose}
                    aria-label="Close menu"
                >
                    ×
                </button>

            </div>

            <nav className="sidebar-nav">

                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >

                        <span className="sidebar-icon">
                            {item.icon}
                        </span>

                        <span>
                            {item.label}
                        </span>

                    </NavLink>
                ))}

            </nav>

        </aside>
    );
}

export default Sidebar;