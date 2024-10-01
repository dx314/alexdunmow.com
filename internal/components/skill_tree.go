package components

import (
	g "github.com/maragudk/gomponents"
	. "github.com/maragudk/gomponents/html"
)

// SkillTree renders the skill tree component with a canvas and JavaScript initialization.
func SkillTree() g.Node {
	return Div(
		Class("w-full h-full"),
		Canvas(
			ID("skillTreeCanvas"),
			Class("w-full h-full"),
		),
		Script(g.Text(`
            window.addEventListener('DOMContentLoaded', function() {
                alexdunmow.initSkillTree(document.getElementById('skillTreeCanvas'));
            });
        `)),
	)
}
