package components

import (
	"fmt"
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// DashboardData holds the data for the dashboard.
type DashboardData struct {
	UserCount    int
	ActiveUsers  int
	TotalRevenue float64
}

// DashboardCard renders a single dashboard card with title and value.
func DashboardCard(title string, value string) g.Node {
	return Div(
		Class("bg-secondary p-4 rounded-lg shadow-md"),
		H3(Class("text-lg font-semibold text-text mb-2"), g.Text(title)),
		P(Class("text-2xl font-bold text-accent"), g.Text(value)),
	)
}

// Dashboard renders the main dashboard view with statistics and recent activity.
func Dashboard(data DashboardData) g.Node {
	return Div(
		Class("space-y-6"),
		H1(Class("text-3xl font-bold text-text"), g.Text("Dashboard")),
		Div(
			Class("grid grid-cols-1 md:grid-cols-3 gap-4"),
			DashboardCard("Total Users", fmt.Sprintf("%d", data.UserCount)),
			DashboardCard("Active Users", fmt.Sprintf("%d", data.ActiveUsers)),
			DashboardCard("Total Revenue", fmt.Sprintf("$%.2f", data.TotalRevenue)),
		),
		Div(
			Class("bg-secondary p-6 rounded-lg shadow-md"),
			H2(Class("text-xl font-semibold text-text mb-4"), g.Text("Recent Activity")),
			Ul(
				Class("space-y-2"),
				Li(Class("text-text"), g.Text("User John Doe logged in")),
				Li(Class("text-text"), g.Text("New order received: #12345")),
				Li(Class("text-text"), g.Text(`Product "Awesome Gadget" is low in stock`)),
			),
		),
	)
}
