package tools

// NotePad holds the note content from ai response to be kept in the notepad
type NotePad struct{
	Header string
	Body string
	Action string
}
// Tool is a struct that represents a tool with its name, description, intent ID and function
type BasaiTool struct {
	Name        string // Name of the tool
	Description string // Description of the tool
	IntentId    string // Intent ID of the tool
	ToolFunc    func(string,string,map[string]interface{}) (string,any,NotePad) // Function of the tool
}


type BasaiTools struct {
	AllTokraiTools map[string]BasaiTool // Map of all Tokrai tools
}
