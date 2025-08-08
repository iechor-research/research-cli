# Research Terminal Go - Makefile

# Variables
BINARY_NAME=research-terminal
MAIN_PATH=cmd/research-terminal/main.go
BUILD_DIR=build
VERSION=$(shell git describe --tags --always --dirty)
LDFLAGS=-ldflags "-X main.Version=$(VERSION) -s -w"

# Go commands
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
GOFMT=$(GOCMD) fmt
GOVET=$(GOCMD) vet

# Platforms
PLATFORMS=darwin linux windows
ARCHITECTURES=amd64 arm64

.PHONY: all build clean test run install deps fmt vet lint help

# Default target
all: test build

# Build the binary
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p $(BUILD_DIR)
	$(GOBUILD) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

# Build for all platforms
build-all:
	@echo "Building for all platforms..."
	@mkdir -p $(BUILD_DIR)
	@for platform in $(PLATFORMS); do \
		for arch in $(ARCHITECTURES); do \
			output_name=$(BUILD_DIR)/$(BINARY_NAME)-$$platform-$$arch; \
			if [ $$platform = "windows" ]; then \
				output_name=$$output_name.exe; \
			fi; \
			echo "Building $$output_name..."; \
			GOOS=$$platform GOARCH=$$arch $(GOBUILD) $(LDFLAGS) -o $$output_name $(MAIN_PATH); \
		done; \
	done
	@echo "Multi-platform build complete"

# Run the application
run: build
	@echo "Running $(BINARY_NAME)..."
	@$(BUILD_DIR)/$(BINARY_NAME)

# Run without building
dev:
	@echo "Running in development mode..."
	@$(GOCMD) run $(MAIN_PATH)

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@$(GOCLEAN)
	@rm -rf $(BUILD_DIR)
	@echo "Clean complete"

# Run tests
test:
	@echo "Running tests..."
	@$(GOTEST) -v -race -coverprofile=coverage.txt -covermode=atomic ./...
	@echo "Tests complete"

# Run tests with coverage report
test-coverage: test
	@echo "Generating coverage report..."
	@$(GOCMD) tool cover -html=coverage.txt -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Install the binary to $GOPATH/bin
install: build
	@echo "Installing $(BINARY_NAME)..."
	@cp $(BUILD_DIR)/$(BINARY_NAME) $(GOPATH)/bin/
	@echo "Installation complete"

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	@$(GOMOD) download
	@$(GOMOD) tidy
	@echo "Dependencies downloaded"

# Format code
fmt:
	@echo "Formatting code..."
	@$(GOFMT) ./...
	@echo "Code formatted"

# Run go vet
vet:
	@echo "Running go vet..."
	@$(GOVET) ./...
	@echo "Vet complete"

# Run linter (requires golangci-lint)
lint:
	@echo "Running linter..."
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run ./...; \
	else \
		echo "golangci-lint not installed. Install with:"; \
		echo "  go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
	fi

# Run all checks
check: fmt vet lint test

# Create a release
release: clean test build-all
	@echo "Creating release..."
	@mkdir -p $(BUILD_DIR)/release
	@for file in $(BUILD_DIR)/*; do \
		if [ -f $$file ] && [ $$file != "$(BUILD_DIR)/release" ]; then \
			tar -czf $$file.tar.gz -C $(BUILD_DIR) $$(basename $$file); \
			mv $$file.tar.gz $(BUILD_DIR)/release/; \
		fi; \
	done
	@echo "Release artifacts created in $(BUILD_DIR)/release/"

# Watch for changes and rebuild (requires entr)
watch:
	@if command -v entr > /dev/null; then \
		find . -name '*.go' | entr -r make run; \
	else \
		echo "entr not installed. Install with:"; \
		echo "  brew install entr  # macOS"; \
		echo "  apt-get install entr  # Ubuntu/Debian"; \
	fi

# Benchmark
bench:
	@echo "Running benchmarks..."
	@$(GOTEST) -bench=. -benchmem ./...

# Update dependencies
update-deps:
	@echo "Updating dependencies..."
	@$(GOGET) -u ./...
	@$(GOMOD) tidy
	@echo "Dependencies updated"

# Generate documentation
docs:
	@echo "Generating documentation..."
	@if command -v godoc > /dev/null; then \
		echo "Starting godoc server on http://localhost:6060"; \
		godoc -http=:6060; \
	else \
		echo "godoc not installed. Install with:"; \
		echo "  go install golang.org/x/tools/cmd/godoc@latest"; \
	fi

# Show help
help:
	@echo "Research Terminal Go - Makefile Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all          - Run tests and build (default)"
	@echo "  build        - Build the binary"
	@echo "  build-all    - Build for all platforms"
	@echo "  run          - Build and run the application"
	@echo "  dev          - Run without building"
	@echo "  clean        - Remove build artifacts"
	@echo "  test         - Run tests"
	@echo "  test-coverage- Run tests with coverage report"
	@echo "  install      - Install binary to GOPATH/bin"
	@echo "  deps         - Download dependencies"
	@echo "  fmt          - Format code"
	@echo "  vet          - Run go vet"
	@echo "  lint         - Run linter (requires golangci-lint)"
	@echo "  check        - Run all checks (fmt, vet, lint, test)"
	@echo "  release      - Create release artifacts"
	@echo "  watch        - Watch for changes and rebuild (requires entr)"
	@echo "  bench        - Run benchmarks"
	@echo "  update-deps  - Update dependencies"
	@echo "  docs         - Generate documentation"
	@echo "  help         - Show this help message"

# Set default target
.DEFAULT_GOAL := all

