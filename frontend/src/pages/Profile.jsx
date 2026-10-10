import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "Standard User",
    about: "Using ContractLensAI for secure AI-based legal contract analysis.",
  });
  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("currentUser");

          navigate("/");
          return;
        }

        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          role: data.role || "Standard User",
          about:
            data.about ||
            "Using ContractLensAI for secure AI-based legal contract analysis.",
        });

        localStorage.setItem("currentUser", JSON.stringify(data));
      } catch (error) {
        console.error("Profile Error:", error);

        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update profile.");
      }

      setProfile({
        ...profile,
        id: data.id,
        name: data.name,
        email: data.email,
        phone: profile.phone,
        role: profile.role,
        about: profile.about,
      });

      localStorage.setItem("currentUser", JSON.stringify(data));

      setIsEditing(false);

      alert("Profile Updated Successfully");
    } catch (error) {
      console.error("Update Profile Error:", error);

      setError(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");

    navigate("/");
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <p className="text-muted mb-4">
        Manage your account information and preferences.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow border-0 rounded-4">
        <div className="card-body p-4">
          <div className="row align-items-start g-4">
            <div className="col-lg-4 text-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                style={{
                  width: "90px",
                  height: "90px",
                  fontSize: "32px",
                  fontWeight: "600",
                }}
              >
                {getInitials(profile.name)}
              </div>

              <h3 className="fw-bold mt-3">{profile.name}</h3>

              <p className="text-muted">{profile.role}</p>

              <span className="badge bg-success">Active</span>

              <div className="mt-3">
                <label
                  htmlFor="ProfilePhoto"
                  className="btn btn-outline-primary btn-sm px-4"
                >
                  Change Photo
                </label>

                <input type="file" id="ProfilePhoto" accept="image/*" hidden />
              </div>
            </div>

            <div className="col-lg-8">
              <h4 className="fw-bold mb-4">Account Information</h4>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Full Name</label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">User ID</label>

                  <input
                    type="text"
                    className="form-control"
                    value={profile.id}
                    disabled
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Role</label>

                  <input
                    type="text"
                    className="form-control"
                    value={profile.role}
                    onChange={handleChange}
                    disabled={!isEditing}
                   
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">About</label>

                  <textarea
                    className="form-control"
                    rows="3"
                    value={profile.about}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-3">
                  {!isEditing ? (
                    <button
                      className="btn btn-primary me-3 px-4 py-2"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary me-3 px-4 py-2"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Profile"}
                      </button>

                      <button
                        className="btn btn-outline-dark px-4 py-2"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <button
                    className="btn btn-danger ms-3 px-4 py-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
