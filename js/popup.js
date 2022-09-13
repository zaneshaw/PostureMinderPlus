const popup = {};

popup.init = function () {
	popup.debug.init();
}

popup.choices = {
	today: {},
	chart: new Chart($("#chart")[0].getContext("2d"), {
		type: 'line',
		data: {
			labels: ['yes', 'no', 'ignore'],
			datasets: [{
				label: 'My First dataset',
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				data: [-1, -1, -1]
			}]
		},

		options: {
			plugins: {
				tooltip: {
					displayColors: false,
					callbacks: {
						title: () => {
							return;
						},
						label: (context) => {
							return `${context.label}: ${context.formattedValue}`;
						}
					}
				},
				legend: {
					display: false
				}
			},
			interaction: {
				mode: "x", // "index"
				intersect: false
			},
			scales: {
				y: {
					suggestedMin: 0,
					suggestedMax: 10
				}
			},
			animation: false
		}
	}),
	update: function (data) {
		const date = new Date().toISOString().split("T")[0];
		const currData = data[date] || {}; // Get today"s data, or empty

		// Update chart
		popup.choices.chart.data.datasets[0].data = [
			currData["yes"] || 0,
			currData["no"] || 0,
			currData["ignore"] || 0
		];
		this.chart.update();

		popup.debug.updateChoiceButtons(currData);

		this.today = currData; // Apply data
	}
}

popup.debug = {
	set lastMessage(msg) {
		$("#msg").text(msg);
		console.log(msg);
	},
	init: function () {
		$("#debug-dialog").click(() => {
			chrome.runtime.sendMessage({ debug: "dialog" });
		});
		$("#debug-clear").click(() => {
			chrome.runtime.sendMessage({ debug: "clear" });
		});
		$("#c-yes-btn").click(() => {
			chrome.runtime.sendMessage({ debug: { choice: "yes" } });
		});
		$("#c-no-btn").click(() => {
			chrome.runtime.sendMessage({ debug: { choice: "no" } });
		});
		$("#c-ignore-btn").click(() => {
			chrome.runtime.sendMessage({ debug: { choice: "ignore" } });
		});

		chrome.runtime.onMessage.addListener((request) => {
			this.lastMessage = JSON.stringify(request);

			if (request.choices) popup.choices.update(request.choices);
		});

		chrome.runtime.sendMessage("getChoices", (response) => {
			this.lastMessage = JSON.stringify(response);

			if (response.choices) popup.choices.update(response.choices);
		});
	},
	updateChoiceButtons: function (data) {
		//TODO Needs a touch-up
		$("#c-yes").text(data["yes"] || "-");
		$("#c-no").text(data["no"] || "-");
		$("#c-ignore").text(data["ignore"] || "-");
	}
}

popup.init();
