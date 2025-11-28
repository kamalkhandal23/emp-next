export default function TopBanner() {
    return (
        <div
            style={{
                background: "red",
                color: "white",
                padding: "10px",
                textAlign: "center",
                fontWeight: "bold",
                position: "fixed",
                top: 0,
                width: "100%",
                zIndex: 1000
            }}
        >
            WARNING: You switched tabs during the exam!
        </div>
    );
}