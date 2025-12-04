// server/services/codeExecutionService.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// ESM compatible __dirname / __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dockerDir = path.resolve(__dirname, '../../docker');

const dockerfilePython = path.join(dockerDir, 'Dockerfile.python');
const dockerfileJs = path.join(dockerDir, 'Dockerfile.javascript');
const dockerfileC = path.join(dockerDir, 'Dockerfile.c');
const dockerfileJava = path.join(dockerDir, 'Dockerfile.java');

// ------------------ Public APIs ------------------ //

const executeCode = async (code, language, inputs, expectedOutputs, isHidden = false) => {
  try {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      /* removed mkdir for Vercel compatibility */
    }

    const containerId = `code-exec-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

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

    const verdict = determineVerdict(result.output, expectedOutputs, result.error);

    return {
      verdict,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memory: result.memory,
    };
  } catch (err) {
    console.error('Execution error:', err);
    return {
      verdict: 'Runtime Error',
      output: '',
      error: err.message,
      executionTime: '0.00s',
      memory: '0MB',
    };
  }
};

const executeCodeMultipleTests = async (code, language, inputs, expectedOutputs, isHidden = false) => {
  try {
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const expectedOutput = expectedOutputs[i];

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
        passed: verdict === 'Accepted',
      });
    }

    const overallVerdict =
      passedCount === inputs.length ? 'Accepted' : passedCount > 0 ? 'Partial' : 'Failed';

    return {
      overallVerdict,
      passedCount,
      totalTests: inputs.length,
      results,
      successRate: Math.round((passedCount / inputs.length) * 100),
    };
  } catch (err) {
    return {
      overallVerdict: 'Runtime Error',
      passedCount: 0,
      totalTests: inputs.length,
      results: [],
      successRate: 0,
      error: err.message,
    };
  }
};

// ------------------ Helpers ------------------ //

const determineVerdict = (output, expectedOutputs, error) => {
  if (error) {
    if (error.includes('Compilation') || error.toLowerCase().includes('syntax')) {
      return 'Compilation Error';
    }
    if (error.toLowerCase().includes('timeout') || error.includes('Time limit')) {
      return 'Time Limit Exceeded';
    }
    return 'Runtime Error';
  }

  const cleanOutput = output.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const cleanExpected = expectedOutputs
    .join('\n')
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  return cleanOutput === cleanExpected ? 'Accepted' : 'Wrong Answer';
};

// ------------------ Language specific runners ------------------ //

const executePythonCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.py`);
  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(codeFile, code);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    await execAsync(
      `docker build -t code-exec-python -f "${dockerfilePython}" "${dockerDir}"`
    );

    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v "${codeFile}":/sandbox/code.py:ro -v "${inputFile}":/sandbox/input.txt:ro code-exec-python bash -c "timeout 10 python3 /sandbox/code.py < /sandbox/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A',
    };
  } catch (error) {
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) errorMessage = 'Time limit exceeded';

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB',
    };
  }
};

const executeJavaScriptCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.js`);
  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(codeFile, code);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    await execAsync(
      `docker build -t code-exec-javascript -f "${dockerfileJs}" "${dockerDir}"`
    );

    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v "${codeFile}":/sandbox/code.js:ro -v "${inputFile}":/sandbox/input.txt:ro code-exec-javascript bash -c "timeout 10 node /sandbox/code.js < /sandbox/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A',
    };
  } catch (error) {
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) errorMessage = 'Time limit exceeded';

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB',
    };
  }
};

const executeCCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.c`);
  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(codeFile, code);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    await execAsync(`docker build -t code-exec-c -f "${dockerfileC}" "${dockerDir}"`);

    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v "${codeFile}":/sandbox/code.c:ro -v "${inputFile}":/sandbox/input.txt:ro code-exec-c bash -c "gcc /sandbox/code.c -o /tmp/exec && timeout 10 /tmp/exec < /sandbox/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A',
    };
  } catch (error) {
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) errorMessage = 'Time limit exceeded';

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB',
    };
  }
};

const executeCppCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, `${containerId}.cpp`);
  const inputFile = path.join(tempDir, `${containerId}_input.txt`);
  fs.writeFileSync(codeFile, code);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    await execAsync(`docker build -t code-exec-cpp -f "${dockerfileC}" "${dockerDir}"`);

    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v "${codeFile}":/sandbox/code.cpp:ro -v "${inputFile}":/sandbox/input.txt:ro code-exec-cpp bash -c "g++ /sandbox/code.cpp -o /tmp/exec && timeout 10 /tmp/exec < /sandbox/input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    fs.unlinkSync(codeFile);
    fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A',
    };
  } catch (error) {
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) errorMessage = 'Time limit exceeded';

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB',
    };
  }
};

const executeJavaCode = async (code, inputs, containerId, tempDir) => {
  const codeFile = path.join(tempDir, 'Main.java');
  const inputFile = path.join(tempDir, 'input.txt');
  fs.writeFileSync(codeFile, code);
  fs.writeFileSync(inputFile, inputs.join('\n'));

  try {
    await execAsync(
      `docker build -t code-exec-java -f "${dockerfileJava}" "${dockerDir}"`
    );

    const dockerCommand = `docker run --rm --name ${containerId} --network none --memory 256m --cpus 0.5 --tmpfs /tmp:rw,noexec,nosuid,size=100m -v "${tempDir}":/sandbox code-exec-java bash -c "cd /sandbox && javac Main.java && timeout 10 java Main < input.txt"`;

    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(dockerCommand);
    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    return {
      output: stdout.trim(),
      error: stderr.trim(),
      executionTime: `${executionTime}s`,
      memory: 'N/A',
    };
  } catch (error) {
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);

    let errorMessage = error.stderr || error.message;
    if (error.code === 124) errorMessage = 'Time limit exceeded';

    return {
      output: error.stdout || '',
      error: errorMessage,
      executionTime: '0.00s',
      memory: '0MB',
    };
  }
};

export { executeCode, executeCodeMultipleTests };
