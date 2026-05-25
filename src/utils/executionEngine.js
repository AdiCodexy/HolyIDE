/**
 * executionEngine.js
 * 
 * Hybrid Execution Engine for Holy IDE.
 * Routes execution between client-side Pyodide for Python and remote Piston API for compiled languages.
 */

let pyodideInstance = null;
let isPyodideLoading = false;

/**
 * Initialize Pyodide asynchronously.
 * Should be called early on page load.
 */
export async function initPyodide() {
  if (pyodideInstance || isPyodideLoading) return;
  isPyodideLoading = true;

  try {
    if (window.loadPyodide) {
      pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
      });
      console.log("Pyodide loaded successfully.");
    } else {
      console.error("Pyodide script not loaded in index.html");
    }
  } catch (error) {
    console.error("Failed to load Pyodide:", error);
  } finally {
    isPyodideLoading = false;
  }
}

/**
 * Execute code using the Hybrid Execution Engine.
 * 
 * @param {string} language - The language to execute (e.g., 'python', 'java').
 * @param {string} code - The source code to execute.
 * @param {string} userInputs - A string containing inputs (e.g. newline separated for multiple inputs).
 * @returns {Promise<{success: boolean, output: string, error: string}>}
 */
export async function executeCode(language, code, userInputs = "") {
  if (language === 'python') {
    return await executePythonWithPyodide(code, userInputs);
  } else {
    return await executeWithOnlineCompiler(code, userInputs);
  }
}

/**
 * Execute Python code client-side using Pyodide.
 */
async function executePythonWithPyodide(code, userInputs) {
  try {
    if (!pyodideInstance) {
      await initPyodide();
      if (!pyodideInstance) {
        throw new Error("Pyodide failed to load.");
      }
    }

    // Split userInputs into an array of lines
    const inputLines = userInputs ? userInputs.split('\n') : [];

    // Captured output
    let stdoutData = [];

    // We will override Pyodide's stdout and stdin
    pyodideInstance.setStdout({
      batched: (text) => {
        stdoutData.push(text);
      }
    });

    pyodideInstance.setStdin({
      stdin: () => {
        if (inputLines.length > 0) {
          // Return the next line of input
          return inputLines.shift() + "\n";
        }
        return "\n"; // EOF or empty if no more inputs
      }
    });

    // Run the code
    await pyodideInstance.runPythonAsync(code);

    return {
      success: true,
      output: stdoutData.join("\n"),
      error: ""
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error.message || String(error)
    };
  }
}

/**
 * Execute compiled languages via remote REST API (onlinecompiler.io).
 */
async function executeWithOnlineCompiler(code, userInputs) {
  try {
    const targetUrl = 'https://api.onlinecompiler.io/api/run-code-sync/';
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}&reqHeaders=authorization:568f8cc77a30debc0a0fba2c24d2c3ab&reqHeaders=content-type:application/json`;

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({
        compiler: 'java',
        code: code,
        input: userInputs || ""
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: result.status === 'success',
      output: result.output,
      error: result.error
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error.message || String(error)
    };
  }
}
