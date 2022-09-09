$("#debug").click(function () {
	chrome.runtime.sendMessage("debug");
});

chrome.runtime.sendMessage("getData", function (response) {
	$("#data").text(JSON.stringify(response));
});