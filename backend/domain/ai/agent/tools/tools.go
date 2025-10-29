package tools

import (
	"log"
	"strings"
)

var (
	Alltools BasaiTools
)

// Initializes the multimodal toolkit for the application.
//
// This function performs the following steps:
// 1. Checks if the `AllSnapshotTools` map is initialized; if not, initializes it with a capacity of 10.
// 2. Creates an instance of the Google Search tool using `gg.GoogleTool()`.
// 3. Adds the websearch tool from the Google tool instance to the `AllSnapshotTools` map.
// 4. Logs a message if the websearch tool is not found in the Google tool instance.
// 5. Prints a console message indicating the successful loading of preliminary tools.
//
// Note: The function uses `log.Println` for logging messages, which will not terminate the program.
func PopulatePreliminaryToolkit() {
	// Initialize the map if not already initialized with a max of only 10 internal tools.
	if Alltools.AllTokraiTools == nil {
		Alltools.AllTokraiTools = make(map[string]BasaiTool, 10)
	}

	computeTokenWeightTool := ComputeTokenWeightTool()
	swapTokenTool := SwapTokenTool()
	updateTokenWeightTool := UpdateTokenWeightTool()

	if computeTool, exists := computeTokenWeightTool["CalculateCurrentValueAndWeights"]; exists {
		Alltools.AllTokraiTools["CalculateCurrentValueAndWeights"] = computeTool
	} else {
		log.Println("Update Token Weight tool not found.")
	}

	if swapTool, exists := swapTokenTool["SwapToken"]; exists {
		Alltools.AllTokraiTools["SwapToken"] = swapTool
	} else {
		log.Println("swap token tool not found.")
	}

	if updateTokenTool, exists := updateTokenWeightTool["UpdateTokenWeight"]; exists {
		Alltools.AllTokraiTools["UpdateTokenWeight"] = updateTokenTool
	} else {
		log.Println("Update Token Weight tool not found.")
	}

	// Print a message to the console indicating that the preliminary tools have been loaded.
	log.Println(`🚀🔮 SYSTEM INITIALIZATION SEQUENCE 🔮🚀
=======================================
⚡️ ⚙️  basketfy Preliminary Toolkit :: ACTIVATED ⚙️ ⚡️
  🧠 Internal Tools :: ALIGNED
  🔧 External Tools Coonectors :: CALIBRATED
  🔬 Tools Integration Module :: PRIMED
✨ Preliminary Tools :: LOADED AND READY ✨
=======================================
🌟 System Potency: MAXIMUM 🌟`)
}

func GetAllTools() (BasaiTools, error) {

	universalTools := BasaiTools{
		AllTokraiTools: make(map[string]BasaiTool),
	}

	for k, v := range Alltools.AllTokraiTools {

		universalTools.AllTokraiTools[k] = v

	}

	return universalTools, nil
}

// RenderToolNames is a function that returns two strings:
// 1. toolList: a concatenated string of all tool names and descriptions,
// 2. toolNames: a comma-separated string of all tool names
func RenderToolNames(tradingTools *BasaiTools) (string, string) {
	var toolList strings.Builder
	var toolNames strings.Builder
	toolList.Grow(len(tradingTools.AllTokraiTools) * 50)  // pre-allocate memory
	toolNames.Grow(len(tradingTools.AllTokraiTools) * 50) // pre-allocate memory

	for _, tool := range tradingTools.AllTokraiTools {
		toolList.WriteString(tool.Name)
		toolList.WriteString(":\n")
		toolList.WriteString(tool.Description)
		toolList.WriteString("\n\n")
		if toolNames.Len() > 0 {
			toolNames.WriteString(",")
		}
		toolNames.WriteString(tool.Name)
	}
	toolList.WriteString("------------")
	return toolList.String(), strings.TrimSuffix(toolNames.String(), ",")
}
