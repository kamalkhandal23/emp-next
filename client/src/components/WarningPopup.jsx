import { useEffect, useState } from "react";

export default function WarningPopup({ onClose }) {
    const [timeLeft, setTimeLeft] = useState(15);  // 15 seconds timer

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onClose();  // auto close when countdown finishes
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999
            }}
        >
            <div
                style={{
                    width: 350,
                    background: "white",
                    padding: "25px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                }}
            >
                <h2 style={{ color: "red", marginBottom: "10px" }}>⚠ Warning!</h2>

                <p>You switched to another tab.</p>

                <h3 style={{ marginTop: "15px" }}>
                    ⏳ Closing in <span style={{ color: "blue" }}>{timeLeft}</span> seconds
                </h3>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: "20px",
                        padding: "10px 18px",
                        background: "blue",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "15px"
                    }}
                >
                    OK
                </button>
            </div>
        </div>
    );
}
