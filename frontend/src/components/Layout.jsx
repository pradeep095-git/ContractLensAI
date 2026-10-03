import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar = () => {
        setSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="app-layout">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            <div className="app-main">

                <Navbar
                    onMenuClick={openSidebar}
                />

                <main className="app-content">
                    <Outlet />
                </main>

                <Footer />

            </div>

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                ></div>
            )}

        </div>
    );
}

export default Layout;