package main

import (
	"alexdunmow.com/internal/components"
	"alexdunmow.com/internal/layout"
	"alexdunmow.com/internal/view"
	"fmt"
	"github.com/joho/godotenv"
	g "github.com/maragudk/gomponents"
	ghttp "github.com/maragudk/gomponents/http"
	"net/http"
	"os"
)

func main() {
	_ = godotenv.Load()
	mux := http.NewServeMux()

	mux.HandleFunc("GET /favicon.ico", view.ServeFavicon)
	mux.HandleFunc("GET /static/", view.ServeStaticFiles)

	mux.HandleFunc("GET /dashboard", ghttp.Adapt(dashboardHandler))
	mux.HandleFunc("GET /settings", ghttp.Adapt(settingsHandler))
	mux.HandleFunc("GET /skills", ghttp.Adapt(skillsHandler))
	mux.HandleFunc("GET /api/sidebar", ghttp.Adapt(sidebarHandler))
	mux.HandleFunc("GET /", ghttp.Adapt(func(w http.ResponseWriter, r *http.Request) (g.Node, error) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return nil, nil
		}

		return homeHandler(w, r)
	}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("server is running on port %s\n", port)
	err := http.ListenAndServe(":"+port, mux)
	if err != nil {
		fmt.Println(err)
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) (g.Node, error) {
	if r.Header.Get("HX-Request") == "true" {
		return components.Home(), nil
	} else {
		return layout.HomePage(), nil
	}
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) (g.Node, error) {
	data := components.DashboardData{
		UserCount:    1000,
		ActiveUsers:  750,
		TotalRevenue: 50000.00,
	}

	if r.Header.Get("HX-Request") == "true" {
		return components.Dashboard(data), nil
	} else {
		return layout.DashboardPage(data), nil
	}
}

func sidebarHandler(w http.ResponseWriter, r *http.Request) (g.Node, error) {
	if r.Header.Get("HX-Request") != "true" {
		http.Redirect(w, r, "/", http.StatusFound)
		return nil, nil
	}
	activeLink := r.URL.Query().Get("activeLink")
	if activeLink == "" {
		activeLink = "home"
	}
	return components.Sidebar(activeLink), nil
}

func skillsHandler(w http.ResponseWriter, r *http.Request) (g.Node, error) {

	if r.Header.Get("HX-Request") == "true" {
		return components.SkillTree(), nil
	} else {
		return layout.SkillsPage(), nil
	}
}

func settingsHandler(w http.ResponseWriter, r *http.Request) (g.Node, error) {
	settings := components.UserSettings{
		Email:           "user@example.com",
		NotificationsOn: true,
		Theme:           "light",
	}

	if r.Header.Get("HX-Request") == "true" {
		return components.Settings(settings), nil
	} else {
		return layout.SettingsPage(settings), nil
	}
}

func updateSettingsHandler(w http.ResponseWriter, r *http.Request) (g.Node, error) {
	// Handle form submission and update settings
	// For now, we'll just render the settings form again
	settings := components.UserSettings{
		Email:           r.FormValue("email"),
		NotificationsOn: r.FormValue("notifications") == "on",
		Theme:           r.FormValue("theme"),
	}

	return components.Settings(settings), nil
}
