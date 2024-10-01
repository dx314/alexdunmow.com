package components

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// Banner renders the header banner with the logo.
func Banner() g.Node {
	return Header(
		Class("p-6 flex flex-col justify-between bg-primary text-text"),
		Img(
			Src("/static/svg/logo.svg"),
			Class("h-20 w-20"),
			Alt("Logo"),
		),
	)
}

// TextAndTitle renders a card with a title and some text.
func TextAndTitle(title, text string) g.Node {
	return Div(
		Class("bg-secondary rounded-lg p-4 shadow-md"),
		H1(Class("text-lg font-bold mb-2"), g.Text(title)),
		P(Class("text-sm text-text"), g.Text(text)),
	)
}

// Home renders the home page content.
func Home() g.Node {
	return Div(
		Class("space-y-6"),
		H1(Class("text-3xl font-bold text-text"), g.Text("Welcome to Your App")),
		P(Class("text-text"), g.Text("This is the home page of your application.")),
	)
}
