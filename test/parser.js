var parser = require('../index.js');
var expect = require('expect.js');
var helpers = require('./helpers.js');
var encode = parser.encode;
var decode = parser.decode;

describe('parser', function(){

  it('exposes types', function(){
    expect(parser.CONNECT).to.be.a('number');
    expect(parser.DISCONNECT).to.be.a('number');
    expect(parser.EVENT).to.be.a('number');
    expect(parser.ACK).to.be.a('number');
    expect(parser.ERROR).to.be.a('number');
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
      expect(e.message).to.match(/Illegal/);
    }
  });

  context.only('performance', function() {
    this.timeout(100000)

    it('does not choke on large objects', function() {
      var data = Array(100).fill(true).reduce(function(p, _, i) {
        p[i] = Array(10).fill(true)
        return p
      }, {})

      var msg = {
        type: parser.EVENT,
        data: data,
        nsp: '/'
      }

      var start = Date.now()

      return Promise.all(Array(1000).fill(true).map(function() {
        return new Promise(function(resolve) {
          helpers.test(msg, resolve)
        })
      }))
      .then(function() {
        console.log(`Took ${Date.now() - start} ms to complete`)
      })
    })
  })
});
