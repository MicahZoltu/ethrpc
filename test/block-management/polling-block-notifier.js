var assert = require("chai").assert;
var MockTransport = require("./mock-transport.js");
var PollingBlockNotifier = require("../../src/block-management/polling-block-notifier.js");

describe("PollingBlockNotifier", function () {
  var mockTransport;
  beforeEach(function () {
    mockTransport = new MockTransport();
  });

  it("polls transport for new blocks", function (done) {
    var transport = {
      getLatestBlock: getLatestBlock
    };
    var pollingBlockNotifier = new PollingBlockNotifier(transport, 1);
    function getLatestBlock(callback) {
      assert.isFunction(callback);
      pollingBlockNotifier.destroy();
      done();
    }
  });

  it("notifies subscribers with block from transport", function (done) {
    var pollingBlockNotifier = new PollingBlockNotifier(mockTransport, 1);
    pollingBlockNotifier.subscribe(function (block) {
      assert.deepEqual(block, mockTransport.getCurrentBlock());
      pollingBlockNotifier.destroy();
      done();
    });
  });

  it("throws exception to transport on invalid block", function (done) {
    mockTransport = {
      getLatestBlock: function (callback) {
        assert.throws(function () { callback(undefined, {}); });
        pollingBlockNotifier.destroy();
      }
    };
    var pollingBlockNotifier = new PollingBlockNotifier(mockTransport, 1);
    pollingBlockNotifier.subscribe(assertingCallback);
    setTimeout(done, 2);
  });

  it("stops polling on destroy", function (done) {
    var pollingBlockNotifier = new PollingBlockNotifier(mockTransport, 1);
    pollingBlockNotifier.destroy();
    mockTransport.getLatestBlock = assertingCallback;
    setTimeout(done, 2);
  });

  it("stops notifying on destroy", function (done) {
    var pollingBlockNotifier = new PollingBlockNotifier(mockTransport, 1);
    pollingBlockNotifier.subscribe(assertingCallback);
    pollingBlockNotifier.destroy();
    setTimeout(done, 2);
  })

  function assertingCallback() {
    assert.isFalse(true, "should not have been called");
  }
});
