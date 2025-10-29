# Build Stage
FROM golang:1.24.3-alpine AS builder

# Add build version arg
ARG BUILD_VERSION=dev

# Add necessary build-time packages
RUN apk add --no-cache \
    gcc \
    musl-dev 

# Install swag CLI globally
RUN go install github.com/swaggo/swag/cmd/swag@latest

# Set working directory
WORKDIR /app

# Copy only dependency files first
COPY go.mod go.sum ./

# Download dependencies (with better caching)
RUN go mod download 

# Copy source code
COPY . .

# Run swag before build
RUN $(go env GOPATH)/bin/swag init -g cmd/main.go -o docs

# Build the application with version information
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s -X main.version=${BUILD_VERSION}" -o basketfyai ./cmd

# Final Stage
FROM alpine:3.19

# Add non-root user
RUN adduser -D appuser

# Install runtime dependencies only
RUN apk add --no-cache \
    tzdata \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/basketfyai .
COPY go.mod ./

# Set proper permissions
RUN chown -R appuser:appuser /app
USER appuser

# Configure container
EXPOSE 8000
ENV PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run application
CMD echo "GO_ENV=$GO_ENV" > /app/.env && \
    echo "GO_PORT=$GO_PORT" >> /app/.env && \
    echo "DB_CONN_URL=$DB_CONN_URL" >> /app/.env && \
    echo "DB_NAME=$DB_NAME" >> /app/.env && \
    echo "DB_SSLMODE=$DB_SSLMODE" >> /app/.env && \
    echo "API_KEY=$API_KEY" >> /app/.env && \
    echo "OKXURL=$OKXURL" >> /app/.env && \
    echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> /app/.env && \
    ./basketfyai