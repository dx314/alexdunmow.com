package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"

	"github.com/autom8ter/dagger"
)

// Skill represents a node in our skills tree
type Skill struct {
	Name     string   `json:"name"`
	Children []string `json:"children"`
	Love     int      `json:"love"`
	Icon     string   `json:"icon"`
}

func main() {
	// Read JSON file
	jsonFile, err := ioutil.ReadFile("skills_tree.json")
	if err != nil {
		log.Fatalf("Error reading JSON file: %v", err)
	}

	// Parse JSON data
	var skillsTree map[string]Skill
	err = json.Unmarshal(jsonFile, &skillsTree)
	if err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}

	// Create a new graph
	graph := dagger.NewGraph()

	// Add nodes and edges to the graph
	for name, skill := range skillsTree {
		// Add the skill as a node
		err := graph.SetNode(dagger.Path{name}, skill)
		if err != nil {
			log.Fatalf("Error setting node: %v", err)
		}

		// Add edges to children
		for _, child := range skill.Children {
			_, err = graph.SetEdge(dagger.Path{name}, dagger.Path{child}, "has_skill")
			if err != nil {
				log.Fatalf("Error setting edge: %v", err)
			}
		}
	}

	// Example: Retrieve and print the children of "Software Engineering"
	printChildrenOf(graph, "Software Engineering")

	// Example: Find all skills that are children of "Technology Skills"
	printChildrenOf(graph, "Technology Skills")

	// New example: Print the entire Programming Languages tree with love levels and icons
	fmt.Println("\nProgramming Languages Tree (with love levels and icons):")
	printProgrammingLanguagesTree(graph, "Programming Languages", 0)

	// Print skills sorted by love level
	printSkillsSortedByLove(graph)
}

func printChildrenOf(graph *dagger.Graph, nodeName string) {
	node, err := graph.GetNode(dagger.Path{nodeName})
	if err != nil {
		log.Fatalf("Error getting node: %v", err)
	}

	skill, ok := node.(Skill)
	if !ok {
		log.Fatalf("Node is not a Skill")
	}

	fmt.Printf("\nChildren of %s %s (Love: %d):\n", skill.Icon, nodeName, skill.Love)
	for _, childName := range skill.Children {
		childNode, _ := graph.GetNode(dagger.Path{childName})
		childSkill, _ := childNode.(Skill)
		fmt.Printf("- %s %s (Love: %d)\n", childSkill.Icon, childName, childSkill.Love)
	}
}

func printProgrammingLanguagesTree(graph *dagger.Graph, nodeName string, depth int) {
	node, err := graph.GetNode(dagger.Path{nodeName})
	if err != nil {
		log.Fatalf("Error getting node: %v", err)
	}

	skill, ok := node.(Skill)
	if !ok {
		log.Fatalf("Node is not a Skill")
	}

	// Print the current node with love level and icon
	fmt.Printf("%s%s %s (Love: %d)\n", getIndentation(depth), skill.Icon, skill.Name, skill.Love)

	// Get and print children
	for _, childName := range skill.Children {
		childEdges, err := graph.GetEdges(dagger.Path{childName}, "has_skill")
		if err != nil {
			log.Fatalf("Error getting edges: %v", err)
		}

		if len(childEdges) == 0 {
			// This is a leaf node (actual programming language)
			childNode, _ := graph.GetNode(dagger.Path{childName})
			childSkill, _ := childNode.(Skill)
			fmt.Printf("%s- %s %s (Love: %d)\n", getIndentation(depth+1), childSkill.Icon, childName, childSkill.Love)
		} else {
			// This is an intermediate node, recurse
			printProgrammingLanguagesTree(graph, childName, depth+1)
		}
	}
}

func getIndentation(depth int) string {
	return strings.Repeat("  ", depth)
}

func printSkillsSortedByLove(graph *dagger.Graph) {
	var skills []Skill
	graph.ForEachNode(func(path dagger.Path, value interface{}) bool {
		skill, ok := value.(Skill)
		if ok {
			skills = append(skills, skill)
		}
		return true
	})

	// Sort skills by love level (descending)
	for i := 0; i < len(skills); i++ {
		for j := i + 1; j < len(skills); j++ {
			if skills[i].Love < skills[j].Love {
				skills[i], skills[j] = skills[j], skills[i]
			}
		}
	}

	fmt.Println("\nSkills sorted by love level (descending):")
	for _, skill := range skills {
		fmt.Printf("%s %s (Love: %d)\n", skill.Icon, skill.Name, skill.Love)
	}
}
