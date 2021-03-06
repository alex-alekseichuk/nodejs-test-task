/**
 * Unit test for FileDump parser.
 */
'use strict';

const logger = {
  error: jest.fn()
};
const db = {
  save: jest.fn()
};

const calls = [
  [{
    From: 'Joe.doe@gmail.com',
    Message: 'Hi Jane'
  }],
  [{
    From: 'JANE.DOE@gmail.com',
    Message: 'Hi Jane. How was yur day today. e are not trading'
  }],
  [{
    From: 'Joe.doe@gmail.com',
    Message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi'
  }],
  [{
    From: 'JANE.DOE@gmail.com',
    Message: 'Great to hear. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,&lt;script&gt;console.error(String.fromCharCode(72, 65, 67, 75, 69, 68))&lt;/script&gt;consectetur, adipisci velit...'
  }]
];

describe('FileDump parser', () => {
  it('should parse correctly CodeTest-XML.xml example', async () => {
    const parse = require('./index')(logger, db);
    await parse('./CodeTest-XML.xml');
    expect(logger.error.mock.calls.length).toBe(0);
    expect(db.save.mock.calls.length).toBe(4);
    expect(db.save.mock.calls).toEqual(calls);
  });
});
