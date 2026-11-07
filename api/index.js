module.exports = (req, res) => {
  try {
    let backendLoadError = null;
    let app = null;

    try {
      app = require('../backend/src/server');
    } catch (e) {
      backendLoadError = {
        message: e.message,
        stack: e.stack,
        code: e.code,
      };
    }

    if (backendLoadError) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify({
        diagnostics: true,
        nodeVersion: process.version,
        cwd: process.cwd(),
        backendLoadError,
      }, null, 2));
    }

    return app(req, res);
  } catch (fatal) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({
      fatal: true,
      message: fatal.message,
      stack: fatal.stack,
    }, null, 2));
  }
};
