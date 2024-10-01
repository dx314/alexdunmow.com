package components

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// ChatSidebar renders the chat sidebar component.
func ChatSidebar() g.Node {
	return Aside(
		ID("chat-sidebar"),
		Class("bg-secondary text-text w-64 min-h-screen p-4 flex flex-col fixed top-0 right-0 shadow-lg"),
		// Header
		Div(
			Class("mb-4 flex items-center justify-between"),
			H2(Class("text-2xl font-bold text-accent"), g.Text("Chat")),
			Button(
				Class("text-accent hover:text-accent-dark transition-colors duration-200"),
				ID("close-chat-sidebar"),
				Data("hx-get", "/"),
				Data("hx-target", "#chat-sidebar"),
				g.Text("✖"),
			),
		),
		// Chat Messages
		Div(
			ID("chat-messages"),
			Class("flex-grow overflow-y-auto space-y-2 border-b border-secondary mb-4 p-2"),
			// Example messages
			Div(
				Class("bg-primary p-2 rounded-lg shadow"),
				P(
					Class("text-sm"),
					Strong(g.Text("User1:")),
					g.Text(" Hey there! How's it going?"),
				),
			),
			Div(
				Class("bg-accent p-2 rounded-lg shadow self-end text-primary"),
				P(
					Class("text-sm"),
					Strong(g.Text("You:")),
					g.Text(" All good here. What about you?"),
				),
			),
		),
		// Input Box
		Div(
			Class("flex items-center space-x-2"),
			Input(
				Type("text"),
				ID("chat-input"),
				Class("flex-grow p-2 border rounded bg-primary text-text"),
				Placeholder("Type a message..."),
			),
			Button(
				ID("send-message"),
				Class("py-2 px-4 bg-accent text-primary rounded hover:bg-opacity-80 transition-colors duration-200"),
				Data("hx-post", "/send-message"),
				// Inline hx-vals JavaScript cannot be passed directly, so add a placeholder and define in script
				Data("hx-vals", `{'message': document.getElementById('chat-input').value}`),
				Data("hx-target", "#chat-messages"),
				g.Text("Send"),
			),
		),
		// Script (JavaScript can be embedded as plain text)
		Script(g.Text(`
            // window.alexdunmow.initChatSidebar();
        `)),
	)
}
