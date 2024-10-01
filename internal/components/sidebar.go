package components

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// Sidebar renders the sidebar component with the given active link.
func Sidebar(activeLink string) g.Node {
	return Aside(
		ID("sidebar"),
		Class("bg-primary text-text w-64 min-h-screen p-4 flex flex-col"),
		Div(
			Class("mb-8"),
			H2(Class("text-2xl font-bold text-accent"), g.Text("Your App")),
		),
		Nav(
			Class("flex-grow"),
			Div(ID("debug-active-link"), g.Text("Current active link: "+activeLink)),
			Ul(
				Class("space-y-2"),
				Li(
					A(
						Href("/"),
						Class(conditionalClass(
							"block py-2 px-4 rounded transition-colors duration-200",
							"bg-secondary", activeLink == "home" || activeLink == "",
							"hover:bg-secondary", activeLink != "home" && activeLink != "",
						)),
						Data("hx-get", "/"),
						Data("hx-push-url", "true"),
						Data("hx-target", "#main-content"),
						Span(Class("inline-block w-6 mr-2"), g.Text("🏠")),
						g.Text(" Home"),
					),
				),
				Li(
					A(
						Href("/dashboard"),
						Class(conditionalClass(
							"block py-2 px-4 rounded transition-colors duration-200",
							"bg-secondary", activeLink == "dashboard",
							"hover:bg-secondary", activeLink != "dashboard",
						)),
						Data("hx-get", "/dashboard"),
						Data("hx-push-url", "true"),
						Data("hx-target", "#main-content"),
						Span(Class("inline-block w-6 mr-2"), g.Text("📊")),
						g.Text(" Dashboard"),
					),
				),
				Li(
					A(
						Href("/skills"),
						Class(conditionalClass(
							"block py-2 px-4 rounded transition-colors duration-200",
							"bg-secondary", activeLink == "skills",
							"hover:bg-secondary", activeLink != "skills",
						)),
						Data("hx-get", "/skills"),
						Data("hx-push-url", "true"),
						Data("hx-target", "#main-content"),
						Span(Class("inline-block w-6 mr-2"), g.Text("⚙️")),
						g.Text(" Skill Tree"),
					),
				),
				Li(
					A(
						Href("/settings"),
						Class(conditionalClass(
							"block py-2 px-4 rounded transition-colors duration-200",
							"bg-secondary", activeLink == "settings",
							"hover:bg-secondary", activeLink != "settings",
						)),
						Data("hx-get", "/settings"),
						Data("hx-push-url", "true"),
						Data("hx-target", "#main-content"),
						Span(Class("inline-block w-6 mr-2"), g.Text("⚙️")),
						g.Text(" Settings"),
					),
				),
			),
		),
		Div(
			Class("mt-auto pt-4 border-t border-secondary"),
			Button(
				Data("hx-post", "/logout"),
				Data("hx-target", "body"),
				Class("w-full text-left block py-2 px-4 rounded hover:bg-secondary transition-colors duration-200"),
				Span(Class("inline-block w-6 mr-2"), g.Text("🚪")),
				g.Text(" Logout"),
			),
		),
		Button(
			ID("theme-switcher"),
			Class("mt-4 py-2 px-4 bg-accent text-primary rounded hover:bg-opacity-80 transition-colors duration-200"),
			g.Text("Toggle Theme"),
		),
		Script(g.Text(`
            window.addEventListener('DOMContentLoaded',function() {
                window.alexdunmow.initSidebar();
            });
        `)),
	)
}

// conditionalClass helps in constructing class strings with conditions.
func conditionalClass(baseClass string, additionalClasses ...interface{}) string {
	finalClass := baseClass

	for i := 0; i < len(additionalClasses); i += 2 {
		if className, ok := additionalClasses[i].(string); ok {
			if condition, ok := additionalClasses[i+1].(bool); ok && condition {
				finalClass += " " + className
			}
		}
	}

	return finalClass
}
