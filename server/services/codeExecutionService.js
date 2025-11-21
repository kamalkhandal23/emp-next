// Mock code execution service - simulates Docker-based sandboxed execution
// In production, this would use Docker containers or Judge0 API

const executeCode = async (code, language, inputs, expectedOutputs, isHidden = false) => {
  try {
    // Simulate execution time
    const executionTime = Math.random() * 2 + 0.1; // 0.1-2.1 seconds
    const memory = Math.floor(Math.random() * 50) + 10; // 10-60 MB

    // Mock verdicts
    const verdicts = ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'];

    // For sample tests, mostly pass; for hidden, random
    let verdict;
    if (!isHidden) {
      verdict = Math.random() > 0.2 ? 'Accepted' : verdicts[Math.floor(Math.random() * verdicts.length)];
    } else {
      verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    }

    // Mock output
    let output = '';
    let error = '';

    if (verdict === 'Accepted') {
      // For accepted, provide expected output
      output = expectedOutputs.join('\n');
    } else if (verdict === 'Wrong Answer') {
      output = 'Wrong output';
    } else if (verdict === 'Runtime Error') {
      error = 'Runtime error occurred';
    } else if (verdict === 'Compilation Error') {
      error = 'Compilation failed';
    } else if (verdict === 'Time Limit Exceeded') {
      error = 'Time limit exceeded';
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, executionTime * 1000));

    return {
      verdict,
      output,
      error,
      executionTime: `${executionTime.toFixed(2)}s`,
      memory: `${memory}MB`
    };
  } catch (err) {
    return {
      verdict: 'Runtime Error',
      output: '',
      error: err.message,
      executionTime: '0.00s',
      memory: '0MB'
    };
  }
};

export { executeCode };
