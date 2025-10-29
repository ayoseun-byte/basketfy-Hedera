package utilities

import (
	"bytes"
	"basai/domain/ai/systemprompts"
	"log"
	//"strings"
)

func ConcatBytes(joiner []byte, words ...[]byte) []byte {
	// Calculate the total length of the resulting byte slice
	totalLen := len(joiner) * (len(words) - 1) // Length contributed by joiners
	for _, word := range words {
		totalLen += len(word)
	}

	if totalLen <= 0 {
		return nil
	}

	// Create a byte slice with the required length
	b := make([]byte, totalLen)

	// Populate the byte slice
	currentIndex := 0
	for i, word := range words {
		copy(b[currentIndex:], word)
		currentIndex += len(word)
		if i < len(words)-1 {
			copy(b[currentIndex:], joiner)
			currentIndex += len(joiner)
		}
	}

	return b
}

// SwitchModelWithCusto.SYSTEMINSTRUCTIONBySyntax selects and constructs the appropriate prompt syntax based on the model name,
// including a custom instruction prompt.
// Args:
// - modelName ([]byte): The name of the model
// - customInstPrompt (string): The custom instruction prompt to be included
// Returns:
// - []byte: The user profile
// - []byte: The instruction prompt
// - []byte: The constructed prompt syntax
func SwitchModelWithCustomInstructionPromptBySyntax(modelName []byte) ([]byte, map[string][]byte) {
	var (
		systemInstructionPrompt []byte
		personaPromptTag        []byte
		featuresYamlFiles       = []string{"user.yaml"}
	)

	yamlFiles := []string{"system.yaml"}

	sys, err := systemprompts.LoadPromptConfigs(string(modelName), yamlFiles...)
	if err != nil {
		log.Print("Error loading config: %v\n", err)
	}
	
	feat, err := systemprompts.LoadFeaturePromptConfigs(featuresYamlFiles...)
	if err != nil {
		log.Print("Error loading config: %v\n", err)
	}
	systemInstructionPrompt = sys.SYSTEMINSTRUCTION

	// fmt.Printf("\n\n systemInstructionPrompt >>> %s\n\n", string(systemInstructionPrompt))

	featMap := map[string][]byte{
		"USERAGENTTHOUGHT": ConcatBytes([]byte("\n"), feat.USERAGENTTHOUGHT),
		"PERSONA":          personaPromptTag,
	}
	// If no match is found, use the generic format suitable for OpenAI/Anthropic models
	return systemInstructionPrompt, featMap

}

func CustomFormat(s []byte, kwargs map[string][]byte) []byte {
	for k := range kwargs {
		s = bytes.ReplaceAll(s, []byte("{"+k+"}"), kwargs[k])
	}
	return s
}
