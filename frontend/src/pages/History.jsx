import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function History() {

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const [viewingId, setViewingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);



  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch(`${API_URL}/contracts/history`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("HISTORY API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to load contract history.",
        );
      }

      const history = Array.isArray(data.history) ? data.history : [];

      setContracts(history);
    } catch (error) {
      console.error("History Error:", error);

      setError(error.message || "Unable to load contract history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, []);

  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    if (search.trim()) {
      const searchText = search.toLowerCase().trim();

      result = result.filter((contract) =>
        contract.file_name?.toLowerCase().includes(searchText),
      );
    }

    if (riskFilter !== "All") {
      result = result.filter(
        (contract) =>
          contract.overall_risk?.toLowerCase() === riskFilter.toLowerCase(),
      );
    }

    return result;
  }, [search, riskFilter, contracts]);

  const handleViewAnalysis = async (contract) => {
    try {
      setViewingId(contract.id);

      console.log("Opening contract:", contract.id);

      const token = getToken();

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/contracts/history/${contract.id}`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      console.log("CONTRACT DETAIL RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to load contract analysis.",
        );
      }

      if (!data.analysis) {
        throw new Error("No analysis is available for this contract.");
      }

      sessionStorage.setItem("contractAnalysis", JSON.stringify(data.analysis));

      sessionStorage.setItem(
        "contractFileName",
        data.file_name || contract.file_name || "",
      );

      sessionStorage.setItem(
        "contractId",
        String(data.contract_id || data.id || contract.id),
      );

      sessionStorage.setItem(
        "contractUploadDate",
        data.upload_date || contract.upload_date || "",
      );

      navigate("/analysis");
    } catch (error) {
      console.error("View Analysis Error:", error);

      alert(error.message || "Unable to open contract analysis.");
    } finally {
      setViewingId(null);
    }
  };

  const handleDelete = async (contract) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${contract.file_name}" from history?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(contract.id);

      const token = getToken();

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const response = await fetch(
        `${API_URL}/contracts/history/${contract.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      console.log("DELETE RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Failed to delete contract.",
        );
      }

      setContracts((previous) =>
        previous.filter((item) => item.id !== contract.id),
      );

      alert("Contract deleted successfully.");
    } catch (error) {
      console.error("Delete Error:", error);

      alert(error.message || "Unable to delete contract.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    try {
      return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true ,
      });
    } catch {
      return "Not available";
    }
  };

  const getRiskBadge = (risk) => {
    const normalized = String(risk || "Unknown").toLowerCase();

    if (normalized === "high") {
      return <span className="badge bg-danger">High</span>;
    }

    if (normalized === "medium") {
      return <span className="badge bg-warning text-dark">Medium</span>;
    }

    if (normalized === "low") {
      return <span className="badge bg-success">Low</span>;
    }

    return <span className="badge bg-secondary">Unknown</span>;
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />

          <p className="text-muted mt-3">Loading contract history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger">
          <strong>Failed to load history</strong>

          <p className="mb-2 mt-2">{error}</p>

          <button className="btn btn-danger" onClick={loadHistory}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Contract History</h2>

          <p className="text-muted mb-0">
            View and manage your previously analyzed contracts.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate("/upload")}>
          + Analyze Contract
        </button>
      </div>

      <div className="row mb-4">
        {/* TOTAL */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">Total Contracts</small>

              <h3 className="fw-bold mt-2">{contracts.length}</h3>
            </div>
          </div>
        </div>

        {/* HIGH */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">High Risk</small>

              <h3 className="fw-bold text-danger mt-2">
                {
                  contracts.filter(
                    (contract) =>
                      contract.overall_risk?.toLowerCase() === "high",
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>

        {/* MEDIUM */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">Medium Risk</small>

              <h3 className="fw-bold text-warning mt-2">
                {
                  contracts.filter(
                    (contract) =>
                      contract.overall_risk?.toLowerCase() === "medium",
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>

        {/* LOW */}

        <div className="col-md-3 mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <small className="text-muted">Low Risk</small>

              <h3 className="fw-bold text-success mt-2">
                {
                  contracts.filter(
                    (contract) =>
                      contract.overall_risk?.toLowerCase() === "low",
                  ).length
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search contract name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
              >
                <option value="All">All Risks</option>

                <option value="High">High Risk</option>

                <option value="Medium">Medium Risk</option>

                <option value="Low">Low Risk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Analyzed Contracts</h4>

            <span className="text-muted">
              {filteredContracts.length} result(s)
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Contract</th>

                  <th>Risk Score</th>

                  <th>Overall Risk</th>

                  <th>Confidence</th>

                  <th>Uploaded</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <h5>No contracts found</h5>

                      <p className="text-muted">
                        Upload and analyze a contract to see it here.
                      </p>

                      <button
                        className="btn btn-primary"
                        onClick={() => navigate("/upload")}
                      >
                        Upload Contract
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((contract) => (
                    <tr key={contract.id}>
                      <td>
                        <div className="fw-semibold">
                          📄 {contract.file_name}
                        </div>

                        <small className="text-muted">ID: #{contract.id}</small>
                      </td>

                      <td>
                        <strong>{contract.risk_score ?? 0}%</strong>
                      </td>

                      <td>{getRiskBadge(contract.overall_risk)}</td>

                      <td>{contract.confidence ?? 0}%</td>

                      <td>
                        <small>{formatDate(contract.upload_date)}</small>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            disabled={viewingId === contract.id}
                            onClick={() => handleViewAnalysis(contract)}
                          >
                            {viewingId === contract.id ? "Opening..." : "View"}
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={deletingId === contract.id}
                            onClick={() => handleDelete(contract)}
                          >
                            {deletingId === contract.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default History;
