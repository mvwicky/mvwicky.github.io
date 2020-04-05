SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

BUNDLE=bundle
CACHE_DIR=.cache
JEKYLL=$(BUNDLE) exec jekyll

SERVEOPTS?=
ALLOPTS=--drafts --unpublished --future
NODE_BIN=node_modules/.bin
TS_NODE=$(NODE_BIN)/ts-node
WEBPACK=$(NODE_BIN)/webpack
WEBPACK_CFG_FILE=webpack.config.ts
WEBPACK_CFG=--config $(WEBPACK_CFG_FILE)
WEBPACK_OUTPUT_DIR=dist

WATCHEXEC=watchexec
WATCH_OPTS=-w src -w $(WEBPACK_CFG_FILE) -p -d 1000

WEBPACK_INPUT=$(shell find src -type f) $(WEBPACK_CFG_FILE) package.json yarn.lock
JEKYLL_INPUT=$(shell git ls-files | grep -v -e 'src\|Makefile') $(shell find _sass -type f)

JEKYLL_CACHE=$(CACHE_DIR)/.build.jekyll
WEBPACK_CACHE=$(CACHE_DIR)/.build.webpack
WEBPACK_DEV_CACHE=$(WEBPACK_CACHE).dev
WEBPACK_PROD_CACHE=$(WEBPACK_CACHE).prod
SERVICE_WORKERS=$(shell find . -type f -depth 1 \( -name 'sw.js*' -o -name 'workbox*' \))

VERIFY_SCRIPT=bin/verify.ts
VERIFY_DEPS=_data/reading.yml assets/reading-schema.json $(VERIFY_SCRIPT)
VERIFY_CACHE=$(CACHE_DIR)/.verify

.PHONY: build-webpack build-jekyll all webpack-dev webpack-watch verify

build: build-webpack build-jekyll

all: webpack-dev
all: SERVEOPTS := $(SERVEOPTS) $(ALLOPTS)
all: serve

fresh: clean update

clean:
	$(BUNDLE) clean
	$(JEKYLL) clean
	-rm -rf $(WEBPACK_OUTPUT_DIR)/*
	rm $(SERVICE_WORKERS)

build-webpack: $(WEBPACK_PROD_CACHE)
build-jekyll: $(JEKYLL_CACHE)

webpack-prod: build-webpack

webpack-dev: $(WEBPACK_DEV_CACHE)

webpack-watch:
	$(WATCHEXEC) $(WATCH_OPTS) make webpack-dev

$(WEBPACK_PROD_CACHE): export NODE_ENV=production
$(WEBPACK_PROD_CACHE): $(WEBPACK_INPUT) $(CACHE_DIR)
	@touch $@
	$(WEBPACK) -p $(WEBPACK_CFG)
	@touch $(WEBPACK_DEV_CACHE)
	@rm $(WEBPACK_DEV_CACHE)

$(JEKYLL_CACHE): export JEKYLL_ENV=production
$(JEKYLL_CACHE): $(JEKYLL_INPUT) $(CACHE_DIR)
$(JEKYLL_CACHE): JEKYLL_ARGS=build
$(JEKYLL_CACHE): jekyll
	@touch $@
	rm -rf _site/node_modules

$(WEBPACK_DEV_CACHE): export NODE_ENV=development
$(WEBPACK_DEV_CACHE): $(WEBPACK_INPUT) $(CACHE_DIR)
	@touch $@
	$(WEBPACK) $(WEBPACK_CFG) --progress
	@touch $(WEBPACK_PROD_CACHE)
	@rm $(WEBPACK_PROD_CACHE)

update:
	$(BUNDLE) update

prod: export JEKYLL_ENV=production
prod: JEKYLL_ARGS=serve $(SERVEOPTS)
prod: jekyll

serve: export JEKYLL_ENV=development
serve: JEKYLL_ARGS=serve $(SERVEOPTS)

profile:
	$(JEKYLL) clean
	$(JEKYLL) build --profile --verbose

doctor: JEKYLL_ARGS=doctor
doctor: jekyll

jekyll:
	@$(JEKYLL) $(JEKYLL_ARGS)

verify: $(VERIFY_CACHE)

clean_sw:
	-rm $(SERVICE_WORKERS)

$(VERIFY_CACHE): $(VERIFY_DEPS) $(CACHE_DIR)
	@touch $@
	$(TS_NODE) $(VERIFY_SCRIPT)

$(CACHE_DIR):
	mkdir $@
