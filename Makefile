.PHONY: install build test typecheck check ui dev-api dev-web clean

install:
	npm install

build:
	npm run build

test:
	npm test

typecheck:
	npm run typecheck

check: typecheck test

ui: build
	node dist/server/cli.js ui

dev-api:
	npm run dev:api

dev-web:
	npm run dev:web

clean:
	rm -rf dist
