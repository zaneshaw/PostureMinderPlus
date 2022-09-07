$("#debug").click(function () {
	chrome.runtime.sendMessage("debug");
});