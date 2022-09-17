const popup = {};

popup.init = function () {
	popup.debug.init();
}

popup.choices = {
	days: 4,
	chart: new Chart($("#chart")[0].getContext("2d"), {
		type: "line",
		data: {
			datasets: [{
				backgroundColor: "rgb(255, 99, 132)",
				borderColor: "rgb(255, 99, 132)",
				pointHitRadius: 20
			}]
		},
		options: {
			plugins: {
				title: {
					display: true,
					text: "Posture Consistency"
				},
				tooltip: {
					displayColors: false,
					callbacks: {
						title: () => {
							return;
						},
						label: (context) => {
							const date = popup.choices.index2date(context.dataIndex).toDateString();

							return `${date}: ${context.formattedValue}`;
						}
					}
				},
				legend: {
					display: false
				}
			},
			interaction: {
				mode: "point", // "index"
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
		const date = new Date().toLocaleDateString();

		// Clear current graph data
		this.chart.data.labels = [];
		this.chart.data.datasets[0].data = [];

		// Add data
		for (let i = 0; i < this.days; i++) {
			this.addData(data, this.index2date(i), i);
		}

		this.chart.update(); // Update chart

		popup.debug.updateChoiceButtons(data[date] || {});
	},
	addData: function (data, date, i) {
		const chart = this.chart;
		const con = this.getCon(data[date.toLocaleDateString()]);
		let label = "";

		const index = popup.choices.days - i - 1;
		if (index === 0) {
			label = "Today";
		} else if (index === 1) {
			label = "Yesterday";
		} else {
			label = [`${index} days`, "ago"];
		}

		chart.data.labels.push(label);
		chart.data.datasets[0].data.push(con);
		chart.update();
	},
	index2date: function (index) {
		const date = new Date();
		date.setDate(date.getDate() - (this.days - index - 1));

		return date;
	}
}

popup.debug = {
	set lastMessage(msg) {
		$("#msg").text(JSON.stringify(msg, undefined, 4));
		console.debug("Last message:", msg);
	},
	toggle: function () {
		$("#debug-content").slideToggle("fast", function () {
			if ($("#debug-content").is(":visible")) {
				$("#debug-toggle").text("\u02c4");
			} else {
				$("#debug-toggle").text("\u02c5");
			}
		});
	},
	init: function () {
		$("#debug-content").hide();

		$("#debug-toggle").click(() => {
			popup.debug.toggle();
		});
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
		$("#app-state-input").change(() => {
			const msg = { state: $("#app-state-input").is(":checked") };
			this.lastMessage = msg;

			chrome.runtime.sendMessage(msg);
		});

		chrome.runtime.onMessage.addListener((request) => {
			this.lastMessage = request;

			if (request.choices) popup.choices.update(request.choices);
		});

		chrome.runtime.sendMessage("getChoices", (response) => {
			this.lastMessage = response;

			popup.choices.update(response.choices);
		});
		
		chrome.runtime.sendMessage("getNotificationState", (response) => {
			this.lastMessage = response;

			$("#app-state-input").prop("checked", response.state);
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
