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
    return await executeWithPistonAPI(language, code, userInputs);
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
 * Execute compiled languages via remote REST API (Piston payload format).
 */
async function executeWithPistonAPI(language, code, userInputs) {
  try {
    // The prompt specified http://YOUR_API_IP:2000/api/v2/execute as placeholder
    // Using the public Piston API which was in use previously
    const API_URL = 'https://emkc.org/api/v2/piston/execute';
    
    const payload = {
      language: language,
      version: "*",
      files: [{
        content: code
      }],
      stdin: userInputs || ""
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.message) {
      return {
        success: false,
        output: "",
        error: data.message
      };
    }

    if (data.run) {
      if (data.run.code !== 0 || data.run.stderr) {
        return {
          success: false,
          output: data.run.stdout || "",
          error: data.run.stderr || `Process exited with code ${data.run.code}`
        };
      }
      
      return {
        success: true,
        output: data.run.stdout || "",
        error: ""
      };
    }

    return {
      success: false,
      output: "",
      error: "Unknown Piston response format"
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error.message || String(error)
    };
  }
}
