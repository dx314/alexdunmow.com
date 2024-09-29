package main

import (
	"alexdunmow.com/internal/component"
	"alexdunmow.com/internal/generate"
	"alexdunmow.com/internal/middleware"
	"alexdunmow.com/internal/template"
	"alexdunmow.com/internal/view"
	"fmt"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {

	err := generate.GenerateMain()
	if err != nil {
		panic(err)
	}

	_ = godotenv.Load()
	mux := http.NewServeMux()

	mux.HandleFunc("GET /favicon.ico", view.ServeFavicon)
	mux.HandleFunc("GET /static/", view.ServeStaticFiles)

	mux.HandleFunc("GET /dashboard", dashboardHandler)
	mux.HandleFunc("GET /settings", settingsHandler)
	mux.HandleFunc("GET /skills", skillsHandler)
	mux.HandleFunc("GET /api/sidebar", sidebarHandler)
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}

		middleware.Chain(w, r, homeHandler)
	})

	fmt.Printf("server is running on port %s\n", os.Getenv("PORT"))
	err = http.ListenAndServe(":"+os.Getenv("PORT"), mux)
	if err != nil {
		fmt.Println(err)
	}

}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("HX-Request") == "true" {
		component.Home().Render(r.Context(), w)
	} else {
		template.HomePage().Render(r.Context(), w)
	}
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	data := component.DashboardData{
		UserCount:    1000,
		ActiveUsers:  750,
		TotalRevenue: 50000.00,
	}

	if r.Header.Get("HX-Request") == "true" {
		component.Dashboard(data).Render(r.Context(), w)
	} else {
		template.DashboardPage(data).Render(r.Context(), w)
	}
}

func sidebarHandler(w http.ResponseWriter, r *http.Request) {
	if r.Header.Get("HX-Request") != "true" {
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	activeLink := r.URL.Query().Get("activeLink")
	if activeLink == "" {
		activeLink = "home"
	}
	component.Sidebar(activeLink).Render(r.Context(), w)
}

func skillsHandler(w http.ResponseWriter, r *http.Request) {

	if r.Header.Get("HX-Request") == "true" {
		component.SkillTree().Render(r.Context(), w)
	} else {
		template.SkillsPage().Render(r.Context(), w)
	}
}

func settingsHandler(w http.ResponseWriter, r *http.Request) {
	settings := component.UserSettings{
		Email:           "user@example.com",
		NotificationsOn: true,
		Theme:           "light",
	}

	if r.Header.Get("HX-Request") == "true" {
		component.Settings(settings).Render(r.Context(), w)
	} else {
		template.SettingsPage(settings).Render(r.Context(), w)
	}
}

func updateSettingsHandler(w http.ResponseWriter, r *http.Request) {
	// Handle form submission and update settings
	// For now, we'll just render the settings form again
	settings := component.UserSettings{
		Email:           r.FormValue("email"),
		NotificationsOn: r.FormValue("notifications") == "on",
		Theme:           r.FormValue("theme"),
	}

	component.Settings(settings).Render(r.Context(), w)
}
