const NEW_TIMELINE = {
	events: [
		{
			name: "Example Event",
			description: "This is an event description!",
			start: 1997,
			end: 2015
		}
	]
}

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
			this.setState({timeline: JSON.parse(JSON.stringify(NEW_TIMELINE))});
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
			this.setState({editing_index: index});
		}

		cancelEditEvent(event) {
			document.querySelector("#input_event_name").value = "";
			document.querySelector("#input_event_description").value = "";
			document.querySelector("#input_event_start").value = "";
			document.querySelector("#input_event_end").value = "";
			this.setState({editing_index: -1});
		}

		editNumeric(event) {
			const id = event.target.id;
			document.querySelector(`#${id}`).value = document.querySelector(`#${id}`).value.replace(/[^0-9]/g, "");
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
				end: isNaN(endYear) ? 2000 : Math.max(startYear, endYear)
			});

			this.state.timeline["events"].sort((a, b) => a.start - b.start);
			this.cancelEditEvent(event);
			event.preventDefault();
		}

		render() {
			const timelineLoaded = Object.keys(this.state.timeline).length > 0;
			const events = this.state.timeline["events"];
			const editingIndex = this.state.editing_index;
			return (
				<div className="row full_height">
					<div className="menu">
						<div className="row">
							<p className="menu_button" onClick={this.newTimeline}>New Timeline</p>
							<p className="menu_button">Open Existing Timeline</p>
							<p className={`menu_button ${timelineLoaded ? "" : "disabled"}`}>Save Timeline</p>
						</div>
						<div className="separator"/>
						{timelineLoaded ? <div className="editor" hidden={!timelineLoaded}>
							<h1>Events</h1>
							<div className="scroll_box">
								<table>
									<tbody>
									{[...Array(events.length)].map((u, index) => (
										<tr key={`event_${index}`}>
											<td className="fill_width no_left_padding">{events[index].name}</td>
											<td className="dates">{events[index].start} - {events[index].end}</td>
											<td><a onClick={(event) => this.editEvent(event, index)}>Edit</a></td>
											<td><a onClick={(event) => this.deleteEvent(event, index)}>Delete</a></td>
										</tr>
									))}
									</tbody>
								</table>
							</div>
							<br/>
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
									placeholder="Event Description"
								/>
								<br/>
								<input
									className="input_text half_width"
									id="input_event_start"
									type="text"
									placeholder="Start Year"
									required={true}
									onChange={this.editNumeric}
								/>
								<input
									className="input_text half_width"
									id="input_event_end"
									type="text"
									placeholder="End Year"
									required={true}
									onChange={this.editNumeric}
								/>
								<br/>
								<input className="input_button half_width" type="submit" value="Submit"/>
								<input className="input_button half_width" type="button" onClick={this.cancelEditEvent} value="Cancel"/>
							</form>
						</div> : null}
					</div>
					<canvas/>
				</div>
			);
		}
	}

	ReactDOM.render(<MainScreen/>, document.querySelector("#react-root"));
}

setup();