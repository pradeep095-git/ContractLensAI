import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";
import History from "./pages/History";
import Profile from "./pages/Profile";

import Layout from "./components/Layout";


function App() {

    return (

        <BrowserRouter>

            <Routes>

              

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


               

                <Route
                    path="/register"
                    element={<Register />}
                />


              
                <Route element={<Layout />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/upload"
                        element={<Upload />}
                    />

                    <Route
                        path="/analysis"
                        element={<Analysis />}
                    />

                    <Route
                        path="/history"
                        element={<History />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                </Route>



                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;