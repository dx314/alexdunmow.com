package layout

import (
	components "alexdunmow.com/internal/components"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// Layout template, which serves as the layout for other pages.
func Layout(title string, activeLink string, children ...g.Node) g.Node {
	return Doctype(HTML(
		Lang("en"),
		Class("h-full"),
		Head(
			Meta(Charset("UTF-8")),
			Meta(Name("viewport"), Content("width=device-width, initial-scale=1.0")),
			Script(Src("https://unpkg.com/htmx.org@1.9.11")),
			Link(Rel("stylesheet"), Href("/static/css/output.css")),
			Link(Rel("stylesheet"), Href("/static/css/theme.css")),
			Title(title),
		),
		Body(
			Class("flex h-full bg-background text-text dark"),
			Data("hx-boost", "true"),
			Div(
				ID("sidebar-container"),
				components.Sidebar(activeLink),
			),
			components.ChatSidebar(),
			Div(
				Class("flex-1 flex flex-col"),
				components.Banner(),
				Main(
					ID("main-content"),
					Class("flex-grow p-6"),
					g.Group(children), // Use g.Group to wrap children nodes correctly
				),
			),
			Script(Src("/static/js/bundle.js")),
		),
	))
}

// HomePage template
func HomePage() g.Node {
	return Layout("Home", "home", components.Home())
}

// DashboardPage template
func DashboardPage(data components.DashboardData) g.Node {
	return Layout("Dashboard", "dashboard", components.Dashboard(data))
}

// SettingsPage template
func SettingsPage(settings components.UserSettings) g.Node {
	return Layout("Settings", "settings", components.Settings(settings))
}

// SkillsPage template
func SkillsPage() g.Node {
	return Layout("Skill Tree", "skills", components.SkillTree())
}
