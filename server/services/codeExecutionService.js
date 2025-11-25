import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Docker-based sandboxed code execution service
const executeCode = async (code, language, inputs, expectedOutputs, isHidden = false) => {
  try {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create unique container name
    const containerId = `code-exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let result;
    switch (language.toLowerCase()) {
      case 'python':
        result = await executePythonCode(code, inputs, containerId, tempDir);
        break;
      case 'javascript':
        result = await executeJavaScriptCode(code, inputs, containerId, tempDir);
        break;
      case 'c':
        result = await executeCCode(code, inputs, containerId, tempDir);
        break;
      case 'cpp':
        result = await executeCppCode(code, inputs, containerId, tempDir);
        break;
      case 'java':
        result = await executeJavaCode(code, inputs, containerId, tempDir);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    // Determine verdict based on output comparison
    const verdict = determineVerdict(result.output, expectedOutputs, result.error);

    return {
      verdict,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memory: result.memory
    };
  } catch (err) {
    console.error('Execution error:', err);
    return {
      verdict: 'Runtime Error',
      output: '',
      error: err.message,
      executionTime: '0.00s',
      memory: '0MB'
    };
  }
};

// Execute code against multiple test cases and return results for each
const executeCodeMultipleTests = async (code, language, inputs, expectedOutputs, isHidden = false) => {
  try {
    const results = [];
    let passedCount = 0;

    // Run code against each test case
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const expectedOutput = expectedOutputs[i];

      // Execute the code for this test case
      const result = await executeCode(code, language, [input], [expectedOutput], isHidden);

      const verdict = result.verdict;
      if (verdict === 'Accepted') {
        passedCount++;
      }

      results.push({
        testCase: i + 1,
        verdict,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memory: result.memory,
        passed: verdict === 'Accepted'
      });
    }

    // Overall verdict based on all tests
    const overallVerdict = passedCount === inputs.length ? 'Accepted' :
                          passedCount > 0 ? 'Partial' : 'Failed';

    return {
      overallVerdict,
      passedCount,
      totalTests: inputs.length,
      results,
      successRate: Math.round((passedCount / inputs.length) * 100)
    };
  } catch (err) {
    return {
      overallVerdict: 'Runtime Error',
      passedCount: 0,
      totalTests: inputs.length,
      results: [],
      successRate: 0,
      error: err.message
    };
  }
};

// Helper function to determine verdict based on output and expected outputs
const determineVerdict = (output, expectedOutputs, error) => {
  if (error) {
    if (error.includes('Compilation') || error.includes('syntax')) {
      return 'Compilation Error';
    }
    if (error.includes('timeout') || error.includes('Time limit')) {
      return 'Time Limit Exceeded';
    }
    return 'Runtime Error';
  }

  // Clean and compare outputs
  const cleanOutput = output.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const cleanExpected = expectedOutputs.join('\n').trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (cleanOutput === cleanExpected) {
    return 'Accepted';
  } else {
    return 'Wrong Answer';
  }
};

// Execute Python code in Docker container
const executePythonCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.py`);
  fs.writeFileSync(codeFile, code);

  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    // Build Docker image if not exists
    await execAsync(`docker build -t code-exec-python -f ../../docker/Dockerfile.python ../../docker/`);

    // Run code in container with resource limits
    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v ${codeFile}:/sandbox/code.py:ro -v ${inputFile}:/sandbox/input.txt:ro code-exec-python timeout 10 python3 /sandbox/code.py < /sandbox/input.txt`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Clean up files
    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A' // Docker stats would be needed for accurate memory
    };
  } catch (error) {
    // Clean up files
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) { // timeout exit code
      errorMessage = 'Time limit exceeded';
    }

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB'
    };
  }
};

// Execute JavaScript code in Docker container
const executeJavaScriptCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.js`);
  fs.writeFileSync(codeFile, code);

  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    // Build Docker image if not exists
    await execAsync(`docker build -t code-exec-javascript -f ../../docker/Dockerfile.javascript ../../docker/`);

    // Run code in container with resource limits
    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v ${codeFile}:/sandbox/code.js:ro -v ${inputFile}:/sandbox/input.txt:ro code-exec-javascript timeout 10 node /sandbox/code.js < /sandbox/input.txt`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Clean up files
    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A'
    };
  } catch (error) {
    // Clean up files
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) {
      errorMessage = 'Time limit exceeded';
    }

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB'
    };
  }
};

// Execute C code in Docker container
const executeCCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.c`);
  fs.writeFileSync(codeFile, code);

  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    // Build Docker image if not exists
    await execAsync(`docker build -t code-exec-c -f ../../docker/Dockerfile.c ../../docker/`);

    // Compile and run code in container with resource limits
    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v ${codeFile}:/sandbox/code.c:ro -v ${inputFile}:/sandbox/input.txt:ro code-exec-c bash -c "gcc /sandbox/code.c -o /tmp/exec && timeout 10 /tmp/exec < /sandbox/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Clean up files
    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A'
    };
  } catch (error) {
    // Clean up files
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) {
      errorMessage = 'Time limit exceeded';
    }

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB'
    };
  }
};

// Execute C++ code in Docker container
const executeCppCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.cpp`);
  fs.writeFileSync(codeFile, code);

  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    // Build Docker image if not exists
    await execAsync(`docker build -t code-exec-cpp -f ../../docker/Dockerfile.c ../../docker/`); // Reuse C Dockerfile

    // Compile and run code in container with resource limits
    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v ${codeFile}:/sandbox/code.cpp:ro -v ${inputFile}:/sandbox/input.txt:ro code-exec-cpp bash -c "g++ /sandbox/code.cpp -o /tmp/exec && timeout 10 /tmp/exec < /sandbox/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Clean up files
    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A'
    };
  } catch (error) {
    // Clean up files
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) {
      errorMessage = 'Time limit exceeded';
    }

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB'
    };
  }
};

// Execute Java code in Docker container
const executeJavaCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.java`);
  fs.writeFileSync(codeFile, code);

  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    // Build Docker image if not exists
    await execAsync(`docker build -t code-exec-java -f ../docker/Dockerfile.java ../docker/`);

    // Compile and run code in container with resource limits
    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v ${codeFile}:/sandbox/Main.java:ro -v ${inputFile}:/sandbox/input.txt:ro code-exec-java bash -c "javac /sandbox/Main.java && timeout 10 java -cp /sandbox Main < /sandbox/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Clean up files
    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A'
    };
  } catch (error) {
    // Clean up files
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) {
      errorMessage = 'Time limit exceeded';
    }

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB'
    };
  }
};

export { executeCode, executeCodeMultipleTests };
