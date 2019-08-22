var parser = require('../index.js');
var expect = require('expect');
var helpers = require('./helpers.js');
var encode = parser.encode;
var decode = parser.decode;

describe('parser', function(){

  it('exposes types', function(){
    expect(parser.CONNECT).toBeA('number');
    expect(parser.DISCONNECT).toBeA('number');
    expect(parser.EVENT).toBeA('number');
    expect(parser.ACK).toBeA('number');
    expect(parser.ERROR).toBeA('number');
  });

  it('encodes connection', function(){
    helpers.test({
      type: parser.CONNECT,
      nsp: '/woot'
    });
  });

  it('encodes disconnection', function(){
    helpers.test({
      type: parser.DISCONNECT,
      nsp: '/woot'
    });
  });

  it('encodes an event', function(){
    helpers.test({
      type: parser.EVENT,
      data: ['a', 1, {}],
      nsp: '/'
    });
    helpers.test({
      type: parser.EVENT,
      data: ['a', 1, {}],
      id: 1,
      nsp: '/test'
    });
  });

  it('encodes an ack', function(){
    helpers.test({
      type: parser.ACK,
      data: ['a', 1, {}],
      id: 123,
      nsp: '/'
    });
  });

  it('decodes a bad binary packet', function(){
    try {
      var decoder = new parser.Decoder();
      decoder.add('5');
    } catch(e){
      expect(e.message).toMatch(/Illegal/);
    }
  });

  context('performance', function() {
    this.timeout(100000)

    it('does not choke on large objects', function() {
      var data = {
        a: Array(100).fill(true).reduce(function(p, _, i) {
          p[i] = Array(100).fill(true)
          return p
        }, {})
      }

      data.a.a = data.a
      data.bin = new Buffer('xxx', 'utf8')

      var msg = {
        type: parser.BINARY_EVENT,
        data: data,
        id: 127,
        nsp: '/'
      }

      var start = Date.now()

      return Promise.all(Array(1000).fill(true).map(function() {
        return new Promise(function(resolve) {
          helpers.test_bin(msg, resolve)
        })
      }))
      .then(function() {
        console.log(`Took ${Date.now() - start} ms to complete`)
      })
    })
  })
});
