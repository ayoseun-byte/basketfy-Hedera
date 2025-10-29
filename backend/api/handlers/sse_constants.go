package handlers




const(
	start_stream_event string = "event: start_stream\n\n"
	message_start_event_marker string = "event: message_start"
	message_start_event string = "event: message_start\n\n"
	message_end_event string ="event: message_end\n\n"
	boot_feedback_event string = "event: boot_feedback\n\n"
	tool_feedback_event string = "event: rebalance_feedback\n\n"
	validation_response_event string = "event: validation_response\n\n"
	tool_response_event string = "event: tool_response\n\n"
	citation_response_event string = "event: citations\n\n"
	end_stream_event string = "event: end_stream\n\n"
	error_event string = "event: error"
)