/**
 * FileDump parse function.
 * It loads messages from the file and put into db.
 * It's based on fast node-xml-stream parser w/o full xml document loading.
 */
'use strict';
let Parser = require('node-xml-stream');
let fs = require('fs');

let _logger, _db;

module.exports = (logger, db) => {
  _logger = logger;
  _db = db;
  return parse;
};

const LVL_FILE = 'file';
const LVL_MESSAGE = 'message';
const LVL_PARAM = 'param';

function parse(xmlPath) {
  return new Promise((resolve, reject) => {
    let parser = new Parser();
    let level = LVL_FILE;
    let message = {};
    let param;
    let hasError;

    parser.on('opentag', (name, attrs) => {
      switch (level) {
        case LVL_FILE:
          switch (name) {
            case 'Message':
              message = {};
              level = LVL_MESSAGE;
              break;
          }
          break;
        case LVL_MESSAGE:
          switch (name) {
            case 'Message':
              level = LVL_PARAM;
              param = 'Message';
              message[param] = '';
              break;
            case 'From':
              level = LVL_PARAM;
              param = 'From';
              message[param] = '';
              break;
          }
          break;
        case LVL_PARAM:
          const sAttrs = Object.keys(attrs).map(key => ` ${key}="${attrs[key]}"`);
          message[param] += `&lt;${name}${sAttrs}&gt;`;
          break;
      }
    });

    parser.on('closetag', async name => {
      switch (level) {
        case LVL_PARAM:
          if (name === param)
            level = LVL_MESSAGE;
          else
            message[param] += `&lt;/${name}&gt;`;
          break;
        case LVL_MESSAGE:
          if (name === 'Message') {
            level = LVL_FILE;
            try {
              await _db.save(message);
            } catch (err) {
              hasError = true;
              _logger.error(err);
            }
          }
          break;
      }
    });

    parser.on('text', text => {
      switch (level) {
        case 'param':
          message[param] += text;
          break;
      }
    });

    parser.on('error', err => {
      _logger.error(err);
      reject(err);
    });

    parser.on('finish', () => {
      if (hasError)
        reject();
      else
        resolve();
    });

    try {
      let stream = fs.createReadStream(xmlPath);
      stream.pipe(parser);
    } catch (err) {
      reject(err);
    }
  });
}
