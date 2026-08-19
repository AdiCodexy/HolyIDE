/**
 * executionEngine.js
 *
 * Hybrid Execution Engine for Holy IDE.
 * - Python  → Pyodide (client-side WASM, zero latency)
 * - Java    → onlinecompiler.io REST API (server-side sandbox)
 */

// ── Pyodide ──────────────────────────────────────────────────────────────────
let pyodideInstance = null;
let isPyodideLoading = false;

export async function initPyodide() {
  if (pyodideInstance || isPyodideLoading) return;
  isPyodideLoading = true;
  try {
    if (window.loadPyodide) {
      pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      });
      console.log("✅ Pyodide loaded.");
    } else {
      console.error("Pyodide script not found in index.html");
    }
  } catch (err) {
    console.error("Failed to load Pyodide:", err);
  } finally {
    isPyodideLoading = false;
  }
}

// ── Main entry point ─────────────────────────────────────────────────────────
/**
 * @param {string} language  - 'python' | 'java'
 * @param {string} code      - source code to execute
 * @param {string} userInput - newline-separated stdin values
 * @returns {Promise<{success: boolean, output: string, error: string}>}
 */
export async function executeCode(language, code, userInput = "") {
  if (language === "python") {
    return executePython(code, userInput);
  }
  if (language === "java") {
    return executeJava(code, userInput);
  }
  return {
    success: false,
    output: "",
    error: `Language "${language}" is not supported for execution yet.`,
  };
}

// ── Python via Pyodide ────────────────────────────────────────────────────────
async function executePython(code, userInput) {
  try {
    if (!pyodideInstance) {
      await initPyodide();
      if (!pyodideInstance) throw new Error("Pyodide failed to initialize.");
    }

    const inputLines = userInput ? userInput.split("\n") : [];
    let stdoutData = [];

    pyodideInstance.setStdout({
      batched: (text) => stdoutData.push(text),
    });

    pyodideInstance.setStdin({
      stdin: () => {
        return inputLines.length > 0 ? inputLines.shift() + "\n" : "\n";
      },
    });

    await pyodideInstance.runPythonAsync(code);

    return { success: true, output: stdoutData.join("\n"), error: "" };
  } catch (err) {
    return { success: false, output: "", error: err.message || String(err) };
  }
}

// ── Java via onlinecompiler.io ────────────────────────────────────────────────
async function executeJava(code, userInput) {
  // API key lives in .env.local → never exposed in source
  const apiKey = import.meta.env.VITE_COMPILER_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      output: "",
      error:
        "Compiler API key not set. Add VITE_COMPILER_API_KEY to .env.local",
    };
  }

  try {
    const targetUrl = "https://api.onlinecompiler.io/api/run-code-sync/";
    // corsproxy.io forwards the request so the browser CORS policy is satisfied
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(
      targetUrl
    )}&reqHeaders=authorization:${apiKey}&reqHeaders=content-type:application/json`;

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        compiler: "openjdk-25",
        code,
        input: userInput || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: result.status === "success",
      output: result.output || "",
      error: result.error || "",
    };
  } catch (err) {
    return { success: false, output: "", error: err.message || String(err) };
  }
}
