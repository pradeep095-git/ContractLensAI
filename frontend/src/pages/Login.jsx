import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });

    };

   
    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password
                    })
                }
            );

            const data = await response.json();

          
            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Invalid email or password."
                );

            }

         

            if (!data.access_token) {

                throw new Error(
                    "Login successful, but access token was not received."
                );

            }


            localStorage.setItem(
                "access_token",
                data.access_token
            );


            const profileResponse = await fetch(
                "http://127.0.0.1:8000/auth/profile",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${data.access_token}`
                    }
                }
            );

            const profileData =
                await profileResponse.json();

        
            if (!profileResponse.ok) {

                throw new Error(
                    profileData.detail ||
                    "Unable to load user profile."
                );

            }

           

            localStorage.setItem(
                "currentUser",
                JSON.stringify(profileData)
            );


            navigate("/dashboard", {
                state: {
                    loginSuccess: true
                }
            });

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            
            localStorage.removeItem("access_token");
            localStorage.removeItem("currentUser");

            setError(
                error.message ||
                "Unable to login."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="container">

            <div className="row justify-content-center mt-5">

                <div className="col-md-5">

                    <div className="card shadow p-4">

                        <h2 className="text-center text-primary">
                            ContractLensAI
                        </h2>

                        <p className="text-center text-muted">
                            AI Powered Legal Contract Analysis Platform
                        </p>

                        <hr />

                        {/* ERROR */}

                        {error && (

                            <div className="alert alert-danger">

                                {error}

                            </div>

                        )}

                        {/* LOGIN FORM */}

                        <form onSubmit={handleLogin}>

                            {/* EMAIL */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter Your Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* PASSWORD */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Enter Your Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >

                                {loading
                                    ? "Logging in..."
                                    : "Login"
                                }

                            </button>

                        </form>

                        <p className="text-center mt-3">

                            Don't have an account?{" "}

                            <Link to="/register">
                                Register
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;