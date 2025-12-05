// client/src/pages/NextGenFreeEdu/CodingPractice.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

export default function CodingPractice() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // optional: local stats (if backend response me bhej raha ho)
  const [stats, setStats] = useState(null);

  const studentInfo = JSON.parse(localStorage.getItem("studentInfo") || "null");
  const studentId = studentInfo?._id || studentInfo?.id || null;

  // ✅ agar student login nahi hai to redirect
  useEffect(() => {
    if (!studentId) {
      navigate("/nextgen/login");
    }
  }, [studentId, navigate]);

  // Default code templates
  const templates = {
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Example: read one line and print it
        String s = sc.nextLine();
        System.out.println("You entered: " + s);
    }
}
`,
    javascript: `// Node.js environment
// Example: Read from stdin and echo back

const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim();
console.log("You entered:", input);
`,
    python: `# Python 3 example
# Reads one line from stdin and prints it

s = input().strip()
print("You entered:", s)
`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s;
    if (getline(cin, s)) {
        cout << "You entered: " << s << "\\n";
    }
    return 0;
}
`,
    c: `#include <stdio.h>

int main() {
    char s[1000];
    if (fgets(s, sizeof(s), stdin)) {
        printf("You entered: %s", s);
    }
    return 0;
}
`,
  };

  // language change pe template set karo
  useEffect(() => {
    setCode(templates[language] || "");
  }, [language]);

  const handleRun = async () => {
    if (!studentId) {
      alert("Please log in again to use coding practice.");
      navigate("/nextgen/login");
      return;
    }

    if (!code.trim()) {
      setError("Please write some code before running.");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setError("");

    try {
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5002/api";

      const res = await fetch(`${baseUrl}/nextgen/coding/practice-run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            localStorage.getItem("authToken") || ""
          }`,
        },
        body: JSON.stringify({
          language,
          code,
          input,
          // ✅ backend ko studentId bhej rahe hain
          studentId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to run code");
      }

      setOutput(data.data?.output || "");
      setError(data.data?.error || "");

      // ✅ agar backend response me updated stats bhej raha ho to store kar lo
      if (data.data?.stats) {
        setStats(data.data.stats);
      }
    } catch (err) {
      setError(err.message || "Something went wrong while running code.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      className="container"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "0.25rem",
              }}
            >
              Coding Practice Playground
            </h1>
            <p style={{ color: "#6b7280", margin: 0 }}>
              Write code, provide custom input, and see output & errors
              instantly.
            </p>

            {/* Optional: show live stats yahi par (agar chaho) */}
            {stats && (
              <div
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.8rem",
                  color: "#4b5563",
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <span>
                  🔥 Streak:{" "}
                  <strong>{Math.floor(stats.streak ?? 0)}</strong> days
                </span>
                <span>
                  ✅ Total Problems Solved:{" "}
                  <strong>{stats.total_solved ?? 0}</strong>
                </span>
              </div>
            )}
          </div>
          <button
            className="btn-outline"
            onClick={() => navigate("/nextgen/login")}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: "1.5rem",
          }}
        >
          {/* Editor Panel */}
          <div className="service-card" style={{ minHeight: "450px" }}>
            {/* Language + Run */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                marginBottom: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 className="service-title" style={{ marginBottom: "0.25rem" }}>
                  Editor
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  }}
                >
                  Select language and write your own code.
                </p>
              </div>
              <div
                style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
              >
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="form-input"
                  style={{ padding: "0.4rem 0.6rem" }}
                >
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
                <button
                  className="btn-primary"
                  onClick={handleRun}
                  disabled={isRunning}
                  style={{ minWidth: "120px" }}
                >
                  {isRunning ? "Running..." : "Run Code ▶"}
                </button>
              </div>
            </div>

            <div
              style={{
                borderRadius: "0.5rem",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}
            >
              <Editor
                height="380px"
                defaultLanguage="java"
                language={language === "javascript" ? "javascript" : language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Input / Output Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Input */}
            <div className="service-card" style={{ flex: 1 }}>
              <h3 className="service-title">Custom Input (stdin)</h3>
              <textarea
                className="form-input"
                rows={6}
                placeholder="Type the input your program should read here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ resize: "vertical" }}
              />
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                }}
              >
                This text will be available to your program on standard input.
              </p>
            </div>

            {/* Output */}
            <div className="service-card" style={{ flex: 1 }}>
              <h3 className="service-title">Output</h3>
              <pre
                style={{
                  background: "#0f172a",
                  color: "#e5e7eb",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  minHeight: "120px",
                  maxHeight: "200px",
                  overflow: "auto",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                {output || "Program output will appear here..."}
              </pre>

              <h4
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#b91c1c",
                  marginBottom: "0.25rem",
                }}
              >
                Errors
              </h4>
              <pre
                style={{
                  background: "#111827",
                  color: "#fecaca",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  minHeight: "80px",
                  maxHeight: "150px",
                  overflow: "auto",
                  fontSize: "0.8rem",
                }}
              >
                {error || "No errors."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
