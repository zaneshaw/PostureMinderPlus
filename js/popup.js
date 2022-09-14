const popup = {};

popup.init = function () {
	popup.debug.init();
}

popup.choices = {
	chart: new Chart($("#chart")[0].getContext("2d"), {
		type: "line",
		data: {
			datasets: [{
				backgroundColor: "rgb(255, 99, 132)",
				borderColor: "rgb(255, 99, 132)"
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
							console.log(context);
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
					suggestedMax: 1,
					ticks: {
						display: false,
						format: {
							style: "percent"
						}
					}
				}
			},
			animation: false
		}
	}),
	getCon: function (data) {
		if (data) {
			if (data.hasOwnProperty("yes") && data.hasOwnProperty("no") && data.hasOwnProperty("ignore")) {
				return data["yes"] / (data["yes"] + data["no"]);
			}
		}
		return 0;
	},
	update: function (data) {
		const date = new Date().toISOString().split("T")[0];

		// Clear current graph data
		this.chart.data.labels = [];
		this.chart.data.datasets[0].data = [];

		// Add data
		const days = 4;
		for (let i = 0; i < days; i++) {
			const date = new Date();
			date.setDate(date.getDate() - (days - i - 1));

			const formattedDate = date.toISOString().split("T")[0];
			this.addData(data, formattedDate);
		}

		this.chart.update(); // Update chart

		popup.debug.updateChoiceButtons(data[date] || {});
	},
	addData: function (data, date) {
		const chart = this.chart;
		const label = date.slice(5);
		const con = this.getCon(data[date]);

		chart.data.labels.push(label);
		chart.data.datasets[0].data.push(con);
		chart.update();
	}
}

popup.debug = {
	set lastMessage(msg) {
		$("#msg").text(JSON.stringify(msg));
		console.log("Last message:", msg);
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
			this.lastMessage = request;

			if (request.choices) popup.choices.update(request.choices);
		});

		chrome.runtime.sendMessage("getChoices", (response) => {
			this.lastMessage = response;

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
