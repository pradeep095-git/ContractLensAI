import { NavLink } from "react-router-dom";

function Sidebar() {
    const navItems=[
    { path: "/dashboard",label:"Dahboard",icon:"⌂"},
    { path: "/upload", label:"Upload Contract",icon:"↑"},
    { path:"/analysis",label:"AI Analysis", icon:"✦"},
    { path: "/history",label:"History", icon:"↶"},
    { path: "/profile",label:"Profile", icon:"♙"}
];
    
    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                ContractLensAI
            </div>

            <nav className="sidebar-nav">

                {navItems.map((item) => (
                    <NavLink
                    key={item.path}
                    to={item.path}
                    className={({isActive}) =>
                    `sidebar-link ${isActive ? "active":""}`
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

        