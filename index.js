const NEW_TIMELINE = {
	events: [
		{
			name: "Example Event",
			description: "This is an event description!",
			start: 1997,
			end: 2015,
			color: "#CCCCCC"
		}
	]
}
const EVENT_HEIGHT = 42;

function setup() {
	"use strict";

	class MainScreen extends React.Component {

		constructor(props) {
			super(props);
			this.newTimeline = this.newTimeline.bind(this);
			this.deleteEvent = this.deleteEvent.bind(this);
			this.editEvent = this.editEvent.bind(this);
			this.cancelEditEvent = this.cancelEditEvent.bind(this);
			this.addEvent = this.addEvent.bind(this);
			this.editNumeric = this.editNumeric.bind(this);
			this.state = {editing_index: -1, timeline: {}};
		}

		newTimeline(event) {
			this.setState({timeline: JSON.parse(JSON.stringify(NEW_TIMELINE))}, this.drawCanvas);
		}

		deleteEvent(event, index) {
			this.state.timeline["events"].splice(index, 1);
			this.setState({});
		}

		editEvent(event, index) {
			const editEvent = this.state.timeline["events"][index];
			document.querySelector("#input_event_name").value = editEvent["name"];
			document.querySelector("#input_event_description").value = editEvent["description"];
			document.querySelector("#input_event_start").value = editEvent["start"].toString();
			document.querySelector("#input_event_end").value = editEvent["end"].toString();
			document.querySelector("#input_event_color").value = editEvent["color"];
			this.setState({editing_index: index});
		}

		cancelEditEvent(event) {
			document.querySelector("#input_event_name").value = "";
			document.querySelector("#input_event_description").value = "";
			document.querySelector("#input_event_start").value = "";
			document.querySelector("#input_event_end").value = "";
			document.querySelector("#input_event_color").value = "#" + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, "0");
			this.setState({editing_index: -1});
		}

		editNumeric(event) {
			event.target.value = event.target.value.replace(/[^0-9-]/g, "");
		}

		addEvent(event) {
			const index = this.state.editing_index;
			if (index >= 0) {
				this.deleteEvent(event, index);
			}

			const startYear = parseInt(document.querySelector("#input_event_start").value);
			const endYear = parseInt(document.querySelector("#input_event_end").value);
			this.state.timeline["events"].push({
				name: document.querySelector("#input_event_name").value,
				description: document.querySelector("#input_event_description").value,
				start: isNaN(startYear) ? 2000 : Math.min(startYear, endYear),
				end: isNaN(endYear) ? 2000 : Math.max(startYear, endYear),
				color: document.querySelector("#input_event_color").value,
			});

			this.state.timeline["events"].sort((a, b) => a.start - b.start);
			this.cancelEditEvent(event);
			this.drawCanvas();
			event.preventDefault();
		}

		drawCanvas() {
			const canvas = document.querySelector("#canvas_timeline");
			const canvasContext = canvas.getContext("2d");
			canvas.width = 0;
			canvas.height = 0;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			canvas.width = width;
			canvas.height = height;
			canvasContext.textBaseline = "middle";
			canvasContext.font = "bold 2em Noto Sans";

			const events = this.state.timeline["events"];
			let timelineStart = Infinity, timelineEnd = -Infinity;
			events.forEach(event => {
				timelineStart = Math.min(event["start"], timelineStart);
				timelineEnd = Math.max(event["end"], timelineEnd);
			});

			function getCoordinateFromBounds(position, start, end, width) {
				return width * (position - start) / (end - start);
			}

			[...Array(events.length)].forEach((u, index) => {
				const event = events[index];
				const startCoordinate = getCoordinateFromBounds(event["start"], timelineStart, timelineEnd, width);
				const endCoordinate = getCoordinateFromBounds(event["end"], timelineStart, timelineEnd, width);

				canvasContext.fillStyle = event.color;
				canvasContext.fillRect(startCoordinate, index * EVENT_HEIGHT, endCoordinate - startCoordinate, EVENT_HEIGHT);

				const text = `${event["name"]} (${this.getFormattedYear(event["start"])} – ${this.getFormattedYear(event["end"])})`;
				const textWidth = canvasContext.measureText(text).width;
				canvasContext.outlineStyle = "#000000";
				canvasContext.fillStyle = "#FFFFFF";
				canvasContext.strokeText(text, Math.min(startCoordinate, width - textWidth), (index + 0.5) * EVENT_HEIGHT);
				canvasContext.fillText(text, Math.min(startCoordinate, width - textWidth), (index + 0.5) * EVENT_HEIGHT);
			});

		}

		getFormattedYear(year) {
			if (year > 0) {
				return `AD ${year}`
			} else {
				return `${-year + 1} BC`
			}
		}

		menuBar(timelineLoaded) {
			return (
				<div className="menu_bar flex">
					<p className="menu_button" onClick={this.newTimeline}>New Timeline</p>
					<p className="menu_button">Open Existing Timeline</p>
					<p className={`menu_button ${timelineLoaded ? "" : "disabled"}`}>Save Timeline</p>
				</div>
			);
		}

		render() {
			const timelineLoaded = Object.keys(this.state.timeline).length > 0;
			const events = this.state.timeline["events"];
			const editingIndex = this.state.editing_index;
			if (timelineLoaded) {
				return (
					<div className="flex full_height">
						<div className="flex full_height left_bar">
							{this.menuBar(true)}
							<div className="separator"/>
							<h2>Events</h2>
							<div className="scroll_box">
								<table>
									<tbody>
									{[...Array(events.length)].map((u, index) => (
										<tr key={`event_${index}`}>
											<td className="fill_width no_left_padding">{events[index]["name"]}</td>
											<td className="dates">{this.getFormattedYear(events[index]["start"])} – {this.getFormattedYear(events[index]["end"])}</td>
											<td><a onClick={(event) => this.editEvent(event, index)}>Edit</a></td>
											<td><a onClick={(event) => this.deleteEvent(event, index)}>Delete</a></td>
										</tr>
									))}
									</tbody>
								</table>
							</div>
							<h2>{editingIndex >= 0 ? "Edit Event" : "Add Event"}</h2>
							<form onSubmit={this.addEvent}>
								<input
									className="input_text"
									id="input_event_name"
									type="text"
									placeholder="Event Name"
									required={true}
								/>
								<br/>
								<textarea
									className="input_text"
									id="input_event_description"
									placeholder="Event Description (optional)"
								/>
								<br/>
								<input
									className="input_text one_third_width"
									id="input_event_start"
									type="text"
									placeholder="Start Year"
									required={true}
									onChange={this.editNumeric}
								/>
								<input
									className="input_text one_third_width"
									id="input_event_end"
									type="text"
									placeholder="End Year"
									required={true}
									onChange={this.editNumeric}
								/>
								<input
									className="input_color one_third_width"
									id="input_event_color"
									type="color"
								/>
								<br/>
								<input className="input_button half_width" type="submit" value="Submit"/>
								<input className="input_button half_width" type="button" onClick={this.cancelEditEvent} value="Cancel"/>
							</form>
						</div>
						<canvas id="canvas_timeline"/>
					</div>
				);
			} else {
				return (
					<div className="flex full_height">
						<div className="flex full_height left_bar">
							{this.menuBar(false)}
							<div className="separator"/>
						</div>
					</div>
				);
			}
		}
	}

	ReactDOM.render(<MainScreen/>, document.querySelector("#react-root"));
}

setup();