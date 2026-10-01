import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <div className="d-flex min-vh-100">

            <Sidebar />

            <div className="flex-grow-1 d-flex flex-column">

                <Navbar />

                <main className="flex-grow-1">
                    <Outlet />
                </main>

                <Footer />

            </div>

        </div>
    );
}

export default Layout;