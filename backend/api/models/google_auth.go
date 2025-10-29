package models

type GoogleAuthRequest struct {
	Code string `json:"code" form:"code"`
}

type APIResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
	Result  any    `json:"result,omitempty"`
}

type GoogleAuthResponse struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}
