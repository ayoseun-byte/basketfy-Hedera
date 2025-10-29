package systemprompts

import (
	// appconfig "snapshotenterprise/internal/config"
	"embed"
	"fmt"
	"gopkg.in/yaml.v2"
	//"strings"
)

var (
	//go:embed gemini/*.yaml features/*.yaml
	configFiles  embed.FS

)


// PromptConfig holds the structure of our YAML file
type promptConfig struct {
	USERAGENTTHOUGHT  []byte `yaml:"user_agent_thought"`
	SYSTEMINSTRUCTION []byte `yaml:"system_instruction"`
}

type intermediatePromptConfig struct {
	SYSTEMINSTRUCTION string `yaml:"system_instruction"`
}


func LoadPromptConfigs(folder string,filenames ...string) (*promptConfig, error) {
	config := &promptConfig{}
	var errs []error

	for _, filename := range filenames {
		// Read the YAML file
		data, err := configFiles.ReadFile(folder + "/" + filename)
		if err != nil {
			errs = append(errs, fmt.Errorf("error reading config file %s: %v", filename, err))
			continue
		}

		// Create a temporary config to hold this file's data
		var tempConfig intermediatePromptConfig
		err = yaml.Unmarshal(data, &tempConfig)
		if err != nil {
			errs = append(errs, fmt.Errorf("error parsing config file %s: %v", filename, err))
			continue
		}

		// Merge the temp config into the main config
		mergeConfigs(config, &tempConfig)
	}

	// Check if we encountered any errors
	if len(errs) > 0 {
		return config, fmt.Errorf("encountered errors while loading configs: %v", errs)
	}

	return config, nil
}


// LoadFeaturePromptConfigs loads feature-specific prompt configurations from YAML files.
// Args:
// - modelName (string): The name of the model
// - filenames ([]string): A list of filenames to load the configurations from
// Returns:
// - *promptConfig: A pointer to the loaded prompt configuration
// - error: An error if any occurred during loading
func LoadFeaturePromptConfigs(filenames ...string) (*promptConfig, error) {
	config := &promptConfig{}
	var errs []error

	for _, filename := range filenames {
		// Read the YAML file from embedded filesystem
		data, err := configFiles.ReadFile("features/" + filename)
		if err != nil {
			errs = append(errs, fmt.Errorf("error reading config file %s: %v", filename, err))
			continue
		}

		// Create a temporary config to hold this file's data
		var tempConfig intermediatePromptConfig
		err = yaml.Unmarshal(data, &tempConfig)
		if err != nil {
			errs = append(errs, fmt.Errorf("error parsing config file %s: %v", filename, err))
			continue
		}

		// Merge the temp config into the main config
		mergeConfigs(config, &tempConfig)
	}

	// Check if we encountered any errors
	if len(errs) > 0 {
		return config, fmt.Errorf("encountered errors while loading feature configs: %v", errs)
	}

	return config, nil
}


// mergeConfigs merges the source config into the destination config
func mergeConfigs(dst *promptConfig, src *intermediatePromptConfig) {

	if src.SYSTEMINSTRUCTION != "" {
		dst.SYSTEMINSTRUCTION = []byte(src.SYSTEMINSTRUCTION)
	}

	

	// Add any other fields here
}
