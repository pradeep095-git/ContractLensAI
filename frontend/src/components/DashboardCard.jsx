function DashboardCard({ title, value, color }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">
            <div
                className="dashboard-card h-100"
                style={{
                    backgroundColor: color,
                }}
            >
                <h5 className="card-title">
                    {title}
                </h5>
                
                <h2 className="card-value">
                    {value}
                </h2>
            </div>
        </div>
    );
}
export default DashboardCard;