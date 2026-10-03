import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RiskCard from "../components/RiskCard";

function Analysis() {

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [analysis] = useState(() => {
    const savedAnalysis = sessionStorage.getItem("contractAnalysis");

    if (
      savedAnalysis &&
      savedAnalysis !== "undefined" &&
      savedAnalysis !== "null"
    ) {
      try {
        return JSON.parse(savedAnalysis);
      } catch (error) {
        console.error("Analysis JSON Error:", error);

        sessionStorage.removeItem("contractAnalysis");

        return null;
      }
    }

    return null;
  });

  const [fileName] = useState(() => {
    return sessionStorage.getItem("contractFileName") || "";
  });

  const [contractId] = useState(() => {
    return sessionStorage.getItem("contractId") || "";
  });

  const [uploadDate] = useState(() => {
    return sessionStorage.getItem("contractUploadDate") || "";
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const formatDate = (date) => {
    if (!date) {
      return "";
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
      return "";
    }
  };

  const handleDownloadReport = async () => {
    if (!analysis) {
      alert("No analysis available.");

      return;
    }

    try {
      setIsDownloading(true);

      let response;

      if (contractId) {
        response = await fetch(
          `${API_URL}/contracts/history/${contractId}/report`,
        );
      } else {
        response = await fetch(`${API_URL}/contracts/report`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            analysis: analysis,

            file_name: fileName || "contract.pdf",
          }),
        });
      }

      if (!response.ok) {
        let message = "Failed to generate PDF report.";

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            message = errorData.detail;
          } else if (errorData.message) {
            message = errorData.message;
          }
        } catch (error) {
          console.error("PDF error response:", error);
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (blob.type !== "application/pdf") {
        throw new Error("Server did not return a PDF file.");
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const baseName = (fileName || "contract").replace(/\.[^/.]+$/, "");

      link.download = `${baseName}_analysis.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Download Error:", error);

      alert("Unable to download PDF report.\n\n" + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    sessionStorage.removeItem("contractAnalysis");

    sessionStorage.removeItem("contractFileName");

    sessionStorage.removeItem("contractId");

    sessionStorage.removeItem("contractUploadDate");

    navigate("/upload");
  };

  const handleBackToHistory = () => {
    navigate("/history");
  };

  if (!analysis) {
    return (
      <div className="container-fluid p-4">
        <div className="card shadow-sm border-0 p-4">
          <h3 className="fw-bold">No contract analysis available.</h3>

          <p className="text-muted">
            The selected contract does not have an analysis loaded.
          </p>

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/upload")}
            >
              Upload Contract
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={handleBackToHistory}
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="fw-bold mb-2">Contract Analysis</h2>

          <p className="text-muted mb-2">AI generated legal analysis report.</p>

          {fileName && (
            <p className="mb-1">
              <strong>Contract:</strong> {fileName}
            </p>
          )}

          {contractId && (
            <small className="text-muted d-block">
              Contract ID: #{contractId}
            </small>
          )}

          {uploadDate && (
            <small className="text-muted d-block">
              Uploaded: {formatDate(uploadDate)}
            </small>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      <div className="row mt-4">
        {/* RISK SCORE */}

        <div className="col-md-4 mb-3">
          <RiskCard
            title="AI Risk Score"
            value={
              analysis.risk_score !== undefined
                ? `${analysis.risk_score}%`
                : "N/A"
            }
            color="#dc3545"
          />
        </div>

        <div className="col-md-4 mb-3">
          <RiskCard
            title="Overall Risk"
            value={analysis.overall_risk || "N/A"}
            color="#fd7e14"
          />
        </div>

        <div className="col-md-4 mb-3">
          <RiskCard
            title="Confidence"
            value={
              analysis.confidence !== undefined
                ? `${analysis.confidence}%`
                : "N/A"
            }
            color="#198754"
          />
        </div>
      </div>

      <div className="card shadow border-0 mt-4">
        <div className="card-body">
          <h4 className="fw-bold">Summary</h4>

          {Array.isArray(analysis.summary) && analysis.summary.length > 0 ? (
            <ul className="mt-3">
              {analysis.summary.map((item, index) => (
                <li key={index} className="mb-2">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3">No summary available.</p>
          )}
        </div>
      </div>

      <div className="card shadow border-0 mt-4">
        <div className="card-body">
          <h4 className="fw-bold">Risky Clauses</h4>

          <div className="table-responsive">
            <table className="table table-hover align-middle mt-3">
              <thead className="table-light">
                <tr>
                  <th>Clause</th>

                  <th
                    style={{
                      width: "160px",
                    }}
                  >
                    Risk
                  </th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(analysis.risky_clauses) &&
                analysis.risky_clauses.length > 0 ? (
                  analysis.risky_clauses.map((item, index) => (
                    <tr key={index}>
                      <td>{item.clause}</td>

                      <td>
                        <span
                          className={
                            item.risk === "High"
                              ? "badge bg-danger"
                              : item.risk === "Medium"
                                ? "badge bg-warning text-dark"
                                : "badge bg-success"
                          }
                        >
                          {item.risk || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-muted">
                      No risky clauses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 mt-4">
        <div className="card-body">
          <h4 className="fw-bold">AI Recommendations</h4>

          {Array.isArray(analysis.recommendations) &&
          analysis.recommendations.length > 0 ? (
            <ul className="mt-3">
              {analysis.recommendations.map((item, index) => (
                <li key={index} className="mb-2">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mt-3">No recommendations available.</p>
          )}

          <div className="mt-4 d-flex flex-wrap gap-2">
            {/* DOWNLOAD */}

            <button
              className="btn btn-success"
              onClick={handleDownloadReport}
              disabled={isDownloading}
            >
              {isDownloading ? "Generating PDF..." : "Download PDF Report"}
            </button>

            {/* HISTORY */}

            <button
              className="btn btn-outline-secondary"
              onClick={handleBackToHistory}
            >
              Back to History
            </button>

            {/* NEW CONTRACT */}

            <button className="btn btn-primary" onClick={handleAnalyzeAnother}>
              Analyze Another Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
