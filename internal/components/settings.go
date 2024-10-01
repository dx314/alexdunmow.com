package components

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// UserSettings holds the user settings data.
type UserSettings struct {
	Email           string
	NotificationsOn bool
	Theme           string
}

// Settings renders the settings form.
func Settings(settings UserSettings) g.Node {
	return Div(
		Class("space-y-6"),
		H1(Class("text-3xl font-bold text-text"), g.Text("Settings")),
		FormEl(
			Method("post"),
			Action("/api/settings"),
			Data("hx-post", "/api/settings"),
			Data("hx-target", "this"),
			Data("hx-swap", "outerHTML"),
			Class("space-y-4"),
			// Email Input
			Div(
				Label(
					For("email"),
					Class("block text-sm font-medium text-text mb-1"),
					g.Text("Email"),
				),
				Input(
					Type("email"),
					ID("email"),
					Name("email"),
					Value(settings.Email),
					Class("w-full px-3 py-2 bg-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-accent"),
				),
			),
			// Notifications Checkbox
			Div(
				Label(
					Class("flex items-center"),
					Input(
						Type("checkbox"),
						Name("notifications"),
						CondAttr(settings.NotificationsOn, "checked", "checked"),
						Class("form-checkbox h-5 w-5 text-accent"),
					),
					Span(Class("ml-2 text-text"), g.Text("Enable notifications")),
				),
			),
			// Theme Selection Dropdown
			Div(
				Label(
					For("theme"),
					Class("block text-sm font-medium text-text mb-1"),
					g.Text("Theme"),
				),
				Select(
					ID("theme"),
					Name("theme"),
					Class("w-full px-3 py-2 bg-secondary text-text rounded-md focus:outline-none focus:ring-2 focus:ring-accent"),
					Option(
						Value("light"),
						CondAttr(settings.Theme == "light", "selected", "selected"),
						g.Text("Light"),
					),
					Option(
						Value("dark"),
						CondAttr(settings.Theme == "dark", "selected", "selected"),
						g.Text("Dark"),
					),
				),
			),
			// Save Settings Button
			Button(
				Type("submit"),
				Class("px-4 py-2 bg-accent text-primary rounded-md hover:bg-opacity-80 transition-colors duration-200"),
				g.Text("Save Settings"),
			),
		),
	)
}

// CondAttr is a helper function to add an attribute conditionally.
func CondAttr(condition bool, attrName string, attrValue string) g.Node {
	if condition {
		return g.Attr(attrName, attrValue)
	}
	return nil
}
