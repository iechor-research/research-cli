# Makefile for research-cli

.PHONY: help install build build-all test lint format preflight clean start debug

help:
	@echo "Makefile for research-cli"
	@echo ""
	@echo "  make install    - npm install"
	@echo "  make build      - npm run build"
	@echo "  make build-all  - npm run build:all"
	@echo "  make test       - npm run test:ci"
	@echo "  make lint       - npm run lint:ci"
	@echo "  make format     - npm run format"
	@echo "  make preflight  - npm run preflight"
	@echo "  make clean      - npm run clean"
	@echo "  make start      - npm run start"
	@echo "  make debug      - npm run debug"

install:
	npm install

build:
	npm run build

build-all:
	npm run build:all

test:
	npm run test:ci

lint:
	npm run lint:ci

format:
	npm run format

preflight:
	npm run preflight

clean:
	npm run clean

start:
	npm run start

debug:
	npm run debug
