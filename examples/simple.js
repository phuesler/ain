#!/usr/bin/env node
/* Simple example showing logging via TCP with callbacks */

var logger = require('../index.js')
              .set("flume-test2", "user", "chris-laptop", "localhost:5140","tcp");
            
logger.on("error", function(err) {
  console.log("Received Error : " + err);
});

logger.send('this is a message', 'info', 'my-tag'); // Custom app tag
logger.log('notice: %d', Date.now());
logger.info('info');
logger.error('error');
