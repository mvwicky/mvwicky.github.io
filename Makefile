SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

BUNDLE=bundle
EXEC=$(BUNDLE) exec
CACHE_DIR=.cache
JEKYLL=$(BUNDLE) exec jekyll

SERVEOPTS=
ALLOPTS=--drafts --unpublished --future
NPM=npm
WEBPACK=node_modules/.bin/webpack
WEBPACK_CFG_FILE=webpack.config.ts
WEBPACK_CFG=--config $(WEBPACK_CFG_FILE)

WATCHEXEC=watchexec
WATCH_OPTS=-w src -w $(WEBPACK_CFG_FILE) -p -d 1000

WEBPACK_INPUT=$(shell find src -type f) $(WEBPACK_CFG_FILE) package.json package-lock.json
JEKYLL_INPUT=$(shell git ls-files | grep -v -e 'src\|Makefile')

JEKYLL_CACHE=$(CACHE_DIR)/.build.jekyll
WEBPACK_CACHE=$(CACHE_DIR)/.build.webpack
WEBPACK_DEV_CACHE=$(WEBPACK_CACHE).dev
WEBPACK_PROD_CACHE=$(WEBPACK_CACHE).prod

.PHONY: build-webpack build-jekyll all webpack-dev webpack-watch

build: build-webpack build-jekyll

all: webpack-dev
all: SERVEOPTS := $(SERVEOPTS) $(ALLOPTS)
all: serve

fresh: clean update all

clean:
	$(BUNDLE) clean
	$(JEKYLL) clean

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
	@touch $@
	$(JEKYLL) build

$(WEBPACK_DEV_CACHE): export NODE_ENV=development
$(WEBPACK_DEV_CACHE): $(WEBPACK_INPUT) $(CACHE_DIR)
	@touch $@
	$(WEBPACK) $(WEBPACK_CFG) --progress
	@touch $(WEBPACK_PROD_CACHE)
	@rm $(WEBPACK_PROD_CACHE)

update:
	$(BUNDLE) update

prod: export JEKYLL_ENV=production
prod:
	$(JEKYLL) serve $(SERVEOPTS)

serve: export JEKYLL_ENV=development
serve:
	$(JEKYLL) serve $(SERVEOPTS)

drafts: SERVEOPTS := $(SERVEOPTS) --drafts
drafts: serve

future: SERVEOPTS := $(SERVEOPTS) --future
future: serve

unpub: SERVEOPTS := $(SERVEOPTS) --unpublished
unpub: serve

profile:
	$(JEKYLL) clean
	$(JEKYLL) build --profile --verbose

doctor:
	$(JEKYLL) doctor

$(CACHE_DIR):
	mkdir $@
