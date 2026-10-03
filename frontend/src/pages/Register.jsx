import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
     
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
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


    

    const handleRegister = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
              `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Registration failed."
                );
            }

            alert(
                "Registration successful! Please login."
            );

            // Automatically open Login page
            navigate("/");

        } catch (error) {

            console.error(
                "Register Error:",
                error
            );

            setError(
                error.message ||
                "Unable to register."
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
                            Create Your Account
                        </p>


                        {/* ERROR */}

                        {error && (

                            <div className="alert alert-danger">

                                {error}

                            </div>

                        )}


                        <form onSubmit={handleRegister}>

                            {/* FULL NAME */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Enter Your Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="mb-3">

                                <label className="form-label">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                           
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
                                    minLength="6"
                                />

                            </div>



                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={loading}
                            >

                                {loading
                                    ? "Creating Account..."
                                    : "Register"
                                }

                            </button>

                        </form>


                        <p className="text-center mt-3">

                            Already have an account?{" "}

                            <Link to="/">
                                Login
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;