import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      const response = await fetch("http://127.0.0.1:8000/contracts/history", {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("currentUser");

        navigate("/", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load dashboard data.");
      }

      const history = Array.isArray(data.history) ? data.history : [];

      setContracts(history);
    } catch (error) {
      console.error("Dashboard Error:", error);

      setError(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer;

    if (location.state?.loginSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuccessMessage("Login successful! Welcome to ContractLensAI.");

      window.history.replaceState({}, document.title, window.location.pathname);

      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    }

    loadDashboardData();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalContracts = contracts.length;

  const analysedContracts = contracts.filter(
    (contract) => contract.has_analysis || contract.analysis,
  ).length;

  const highRisk = contracts.filter(
    (contract) => contract.overall_risk === "High",
  ).length;

  const mediumRisk = contracts.filter(
    (contract) => contract.overall_risk === "Medium",
  ).length;

  const lowRisk = contracts.filter(
    (contract) => contract.overall_risk === "Low",
  ).length;

  const getPercentage = (value) => {
    if (totalContracts === 0) {
      return 0;
    }

    return Math.round((value / totalContracts) * 100);
  };

  const highRiskPercentage = getPercentage(highRisk);

  const mediumRiskPercentage = getPercentage(mediumRisk);

  const lowRiskPercentage = getPercentage(lowRisk);

  const recentContracts = [...contracts]
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
    .slice(0, 5);

  const handleViewAnalysis = async (contract) => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/contracts/history/${contract.id}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("currentUser");

        navigate("/", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load contract analysis.");
      }

      sessionStorage.setItem("contractAnalysis", JSON.stringify(data.analysis));

      sessionStorage.setItem("contractFileName", data.file_name);

      sessionStorage.setItem("contractId", String(data.contract_id || data.id));

      navigate("/analysis");
    } catch (error) {
      console.error("Analysis Error:", error);

      alert(error.message || "Unable to open contract analysis.");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown";
    }
  };

  const getRiskBadge = (risk) => {
    if (risk === "High") {
      return <span className="badge bg-danger">High</span>;
    }

    if (risk === "Medium") {
      return <span className="badge bg-warning text-dark">Medium</span>;
    }

    if (risk === "Low") {
      return <span className="badge bg-success">Low</span>;
    }

    return <span className="badge bg-secondary">Unknown</span>;
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />

          <p className="text-muted mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger">
          <h5 className="fw-bold">Failed to load dashboard</h5>

          <p className="mb-3">{error}</p>

          <button className="btn btn-danger" onClick={loadDashboardData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-3">
      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm"
          role="alert"
        >
          <strong>✓ Login Successful!</strong> {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
          />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Dashboard</h1>

          <p className="text-muted mb-0">
            Overview of your contract analysis and risk insights.
          </p>
        </div>

        <button
          className="btn btn-primary px-4"
          onClick={() => navigate("/upload")}
        >
          + Analyze Contract
        </button>
      </div>

      <div className="row g-4 mb-4">
        {/* TOTAL */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              borderLeft: "5px solid #0d6efd",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2">Total Contracts</p>

                  <h2 className="fw-bold mb-0">{totalContracts}</h2>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#e7f0ff",
                    color: "#0d6efd",
                  }}
                >
                  📄
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI ANALYSED */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              borderLeft: "5px solid #198754",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2">AI Analysed</p>

                  <h2 className="fw-bold mb-0">{analysedContracts}</h2>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#e8f7ef",
                    color: "#198754",
                  }}
                >
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HIGH RISK */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              borderLeft: "5px solid #dc3545",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2">High Risk</p>

                  <h2 className="fw-bold text-danger mb-0">{highRisk}</h2>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#fdeaea",
                    color: "#dc3545",
                  }}
                >
                  ⚠
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOW RISK */}
        <div className="col-xl-3 col-md-6">
          <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{
              borderLeft: "5px solid #20c997",
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2">Low Risk</p>

                  <h2 className="fw-bold text-success mb-0">{lowRisk}</h2>
                </div>

                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#e8faf5",
                    color: "#20c997",
                  }}
                >
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-1">Quick Actions</h5>

          <p className="text-muted small mb-3">
            Start a new contract analysis or review previous results.
          </p>

          <div className="d-flex gap-3 flex-wrap">
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/upload")}
            >
              Upload Contract
            </button>

            <button
              className="btn btn-outline-primary px-4"
              onClick={() => navigate("/analysis")}
            >
              AI Analysis
            </button>

            <button
              className="btn btn-outline-secondary px-4"
              onClick={() => navigate("/history")}
            >
              View History
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* RECENT CONTRACTS */}
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-1">Recent Contracts</h5>

                  <p className="text-muted small mb-0">
                    Your recently analyzed contracts.
                  </p>
                </div>

                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate("/history")}
                >
                  View All
                </button>
              </div>

              {recentContracts.length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-2">📄</div>

                  <h6 className="fw-bold">No contracts yet</h6>

                  <p className="text-muted">
                    Upload your first contract to begin analysis.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/upload")}
                  >
                    Analyze Contract
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Contract</th>

                        <th>Risk</th>

                        <th>Score</th>

                        <th>Date</th>

                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentContracts.map((contract) => (
                        <tr key={contract.id}>
                          <td>
                            <div className="fw-semibold">
                              📄 {contract.file_name}
                            </div>

                            <small className="text-muted">
                              ID: #{contract.id}
                            </small>
                          </td>

                          <td>{getRiskBadge(contract.overall_risk)}</td>

                          <td>
                            <strong>{contract.risk_score}%</strong>
                          </td>

                          <td>
                            <small>{formatDate(contract.upload_date)}</small>
                          </td>

                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewAnalysis(contract)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RISK OVERVIEW */}
        <div className="col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-1">Risk Overview</h5>

              <p className="text-muted small mb-4">
                Contract risk distribution.
              </p>

              {/* HIGH */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>High Risk</span>

                  <strong className="text-danger">{highRisk}</strong>
                </div>

                <div
                  className="progress"
                  style={{
                    height: "9px",
                  }}
                >
                  <div
                    className="progress-bar bg-danger"
                    style={{
                      width: `${highRiskPercentage}%`,
                    }}
                  />
                </div>

                <small className="text-muted">
                  {highRiskPercentage}% of contracts
                </small>
              </div>

              {/* MEDIUM */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Medium Risk</span>

                  <strong className="text-warning">{mediumRisk}</strong>
                </div>

                <div
                  className="progress"
                  style={{
                    height: "9px",
                  }}
                >
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${mediumRiskPercentage}%`,
                    }}
                  />
                </div>

                <small className="text-muted">
                  {mediumRiskPercentage}% of contracts
                </small>
              </div>

              {/* LOW */}
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Low Risk</span>

                  <strong className="text-success">{lowRisk}</strong>
                </div>

                <div
                  className="progress"
                  style={{
                    height: "9px",
                  }}
                >
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${lowRiskPercentage}%`,
                    }}
                  />
                </div>

                <small className="text-muted">
                  {lowRiskPercentage}% of contracts
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
