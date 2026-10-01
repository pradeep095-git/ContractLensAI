function RiskCard({ title, value, color }) {
    return (
        <div
            className="Card shadow border-0 h-100"
            style={{
                borderTop: `6px solid ${color}`,
                borderRadius: "16px"
            }}
        >

            <div className="card-body text-center">

            <h6 className="text-muted fw-semibold">{title}</h6>

            <h1
                className="fw-bold mt-3"
                style={{ color }}

            >
                {value}
            </h1>
        </div>
    </div>
    );
}
export default RiskCard;