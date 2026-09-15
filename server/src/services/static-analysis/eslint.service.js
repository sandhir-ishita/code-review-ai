const { ESLint } = require("eslint");

const analyzeJavaScript = async (code) => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
  ecmaVersion: "latest",
  sourceType: "module",
  globals: {
    console: "readonly",
  },
},
      rules: {
        "no-unused-vars": "warn",
        "no-undef": "error",
        "no-unreachable": "error",
        "no-constant-condition": "warn",
        "eqeqeq": "warn",
      },
    },
  });

  const results = await eslint.lintText(code, {
    filePath: "submission.js",
  });

  const result = results[0];

  return {
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    messages: result.messages.map((message) => ({
      ruleId: message.ruleId,
      severity: message.severity === 2 ? "error" : "warning",
      message: message.message,
      line: message.line,
      column: message.column,
      endLine: message.endLine,
      endColumn: message.endColumn,
    })),
  };
};

module.exports = {
  analyzeJavaScript,
};