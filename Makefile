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
WEBPACK_OUTPUT_DIR=dist
TRASH=$(NODE_BIN)/trash

WEBPACK_INPUT=$(shell find src -type f) $(WEBPACK_CFG_FILE) package.json yarn.lock
JEKYLL_DIRS=$(shell find . -maxdepth 1 -type d -not -name '_site' -name '_*')
JEKYLL_INPUT=$(shell find $(JEKYLL_DIRS) -type f) _config.yml Gemfile Gemfile.lock
JEKYLL_OUTPUT_DIR=_site
SW_OUTPUT_DIR=$(JEKYLL_OUTPUT_DIR)/dist/sw
SW_OUTPUT=$(shell find $(SW_OUTPUT_DIR) -type f -not -name '.*')

JEKYLL_CACHE=$(CACHE_DIR)/.build.jekyll
WEBPACK_CACHE=$(CACHE_DIR)/.build.webpack
WEBPACK_DEV_CACHE=$(WEBPACK_CACHE).dev
WEBPACK_PROD_CACHE=$(WEBPACK_CACHE).prod
SERVICE_WORKERS=$(shell find . -maxdepth 1 -type f \( -name 'sw.js*' -o -name 'workbox*' \))

VERIFY_SCRIPT=bin/verify.ts
VERIFY_DEPS=_data/reading.yml assets/reading-schema.json $(VERIFY_SCRIPT)
VERIFY_CACHE=$(CACHE_DIR)/.verify

.PHONY: build build-webpack build-jekyll all webpack-dev webpack-prod verify jekyll prod \
	serve profile doctor clean-jekyll clean-bundle clean-webpack copy-sw


build: build-webpack build-jekyll copy-sw

all: webpack-dev
all: SERVEOPTS := $(SERVEOPTS) $(ALLOPTS)
all: serve

clean: clean-bundle clean-jekyll clean-webpack

build-webpack: $(WEBPACK_PROD_CACHE)

build-jekyll: $(JEKYLL_CACHE)

webpack-prod: build-webpack

webpack-dev: $(WEBPACK_DEV_CACHE)

$(WEBPACK_PROD_CACHE): export NODE_ENV=production
$(WEBPACK_PROD_CACHE): $(WEBPACK_INPUT) $(CACHE_DIR)
	@touch $@
	$(WEBPACK) -p --config $(WEBPACK_CFG_FILE)
	@touch $(WEBPACK_DEV_CACHE)
	@rm $(WEBPACK_DEV_CACHE)

$(JEKYLL_CACHE): export JEKYLL_ENV=production
$(JEKYLL_CACHE): JEKYLL_ARGS=build --incremental
$(JEKYLL_CACHE): $(JEKYLL_INPUT) $(CACHE_DIR) jekyll
	@touch $@

$(WEBPACK_DEV_CACHE): export NODE_ENV=development
$(WEBPACK_DEV_CACHE): $(WEBPACK_INPUT) $(CACHE_DIR)
	@touch $@
	$(WEBPACK) --config $(WEBPACK_CFG_FILE) --progress
	@touch $(WEBPACK_PROD_CACHE)
	@rm $(WEBPACK_PROD_CACHE)

update: BUNDLE_ARGS=update
update: bundle

prod: export JEKYLL_ENV=production
prod: JEKYLL_ARGS=serve $(SERVEOPTS)
prod: jekyll

serve: export JEKYLL_ENV=development
serve: JEKYLL_ARGS=serve $(SERVEOPTS)
serve: jekyll

profile: JEKYLL_ARGS=build --profile --verbose
profile: jekyll

doctor: JEKYLL_ARGS=doctor
doctor: jekyll

clean-jekyll: JEKYLL_ARGS=clean
clean-jekyll: jekyll

clean-bundle: BUNDLE_ARGS=clean
clean-bundle: bundle

bundle:
	@$(BUNDLE) $(BUNDLE_ARGS)

jekyll:
	@$(JEKYLL) $(JEKYLL_ARGS)

verify: $(VERIFY_CACHE)

clean-webpack:
	@$(TRASH) $(WEBPACK_OUTPUT_DIR)
	@mkdir $(WEBPACK_OUTPUT_DIR)

copy-sw:
	@find $(SW_OUTPUT_DIR) -type f -not -name '.*' -print0 | \
		xargs -0 -I'{}' -t mv '{}' $(JEKYLL_OUTPUT_DIR)/

$(VERIFY_CACHE): $(VERIFY_DEPS) $(CACHE_DIR)
	@touch $@
	@echo $?
	$(TS_NODE) $(VERIFY_SCRIPT)

$(CACHE_DIR):
	mkdir $@
