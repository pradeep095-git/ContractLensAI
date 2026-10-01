import { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import React from "react";
function Upload() {
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:8000";

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PDF, DOC or DOCX file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    handleFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    handleFile(file);
  };

  const removeFile = () => {
    if (isUploading) return;

    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (isUploading) {
      return;
    }

    if (!selectedFile) {
      alert("Please select a contract first.");
      return;
    }

    sessionStorage.removeItem("contractAnalysis");

    sessionStorage.removeItem("contractFileName");

    sessionStorage.removeItem("contractId");

    setIsUploading(true);

    const formData = new FormData();

    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/contracts/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      console.log("=================================");

      console.log("UPLOAD RESPONSE");

      console.log("Status:", response.status);

      console.log("File:", selectedFile.name);

      console.log("Backend File Name:", data.file_name);

      console.log("Contract ID:", data.contract_id);

      console.log("Cached:", data.cached);

      console.log("Analysis:", data.analysis);

      console.log("=================================");

      if (!response.ok) {
        throw new Error(
          data.message || data.detail || `Server Error ${response.status}`,
        );
      }

      if (!data.analysis) {
        throw new Error(data.message || "Backend did not return AI analysis.");
      }

      sessionStorage.setItem("contractAnalysis", JSON.stringify(data.analysis));

      sessionStorage.setItem(
        "contractFileName",
        data.file_name || selectedFile.name,
      );

      if (data.contract_id) {
        sessionStorage.setItem("contractId", String(data.contract_id));
      }

      console.log("Saved Contract ID:", sessionStorage.getItem("contractId"));

      console.log(
        "Saved File Name:",
        sessionStorage.getItem("contractFileName"),
      );

      console.log(
        "Saved Analysis:",
        sessionStorage.getItem("contractAnalysis"),
      );

      setIsUploading(false);

      if (data.cached === true) {
        alert(
          "This contract was already analyzed. Existing analysis has been loaded.",
        );
      } else {
        alert("Contract uploaded and analyzed successfully!");
      }

      navigate("/analysis");
    } catch (error) {
      console.error("Upload Error:", error);

      setIsUploading(false);

      alert("Upload failed.\n\n" + error.message);
    }
  };

  return (
    <main className="container-fluid p-4">
      <p className="text-muted mb-4">
        Upload your legal contract for AI analysis.
      </p>

      <div className="upload-container">
        <div
          className={`upload-dropzone ${isDragging ? "upload-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📄</div>

          <h4 className="fw-bold mt-3">Drag & Drop Contract Here</h4>

          <p className="text-muted mb-3">or select a file from your device</p>

          <input
            type="file"
            id="fileInput"
            accept=".pdf,.doc,.docx"
            hidden
            onChange={handleFileChange}
          />

          <label htmlFor="fileInput" className="btn btn-primary px-4">
            Choose File
          </label>

          <p className="mt-4 text-muted">Supported Formats: PDF, DOC, DOCX</p>
        </div>

        {selectedFile && (
          <div className="selected-file-card mt-4">
            <div className="file-info">
              <div className="file-icon">📄</div>

              <div>
                <h6 className="mb-2 fw-bold">{selectedFile.name}</h6>

                <small className="text-muted">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </small>
              </div>
            </div>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={removeFile}
              disabled={isUploading}
            >
              Remove
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <button
            className="btn btn-success btn-lg px-5"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? "Analyzing Contract..." : "Upload Contract"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default Upload;
