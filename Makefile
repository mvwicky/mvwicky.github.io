SHELL:=bash
.ONESHELL:
.SHELLFLAGS:=-eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

BUNDLE=bundle
EXEC=$(BUNDLE) exec
CACHE_DIR=.cache
JEKYLL=$(EXEC) jekyll

SERVEOPTS=
ALLOPTS=--drafts --unpublished --future
YARN=yarn
WEBPACK=node_modules/.bin/webpack
WEBPACK_CFG=--config webpack.config.js

WATCHEXEC=watchexec
WATCH_OPTS=-w src -w webpack.config.js -p -d 1000

YARN_INPUT=$(shell find src -type f) webpack.config.js package.json yarn.lock
JEKYLL_INPUT=$(shell git ls-files | grep -v -e 'src\|Makefile')

JEKYLL_CACHE=$(CACHE_DIR)/.build.jekyll
YARN_CACHE=$(CACHE_DIR)/.build.yarn
YARN_DEV_CACHE=$(YARN_CACHE).dev

.PHONY: build-yarn build-jekyll all

build: build-yarn build-jekyll

all: yarn-dev
all: SERVEOPTS := $(SERVEOPTS) $(ALLOPTS)
all: serve

fresh: clean update all

clean:
	$(BUNDLE) clean
	$(JEKYLL) clean

build-yarn: $(YARN_CACHE)
build-jekyll: $(JEKYLL_CACHE)

yarn-dev: $(YARN_DEV_CACHE)

yarn-watch:
	$(WATCHEXEC) $(WATCH_OPTS) make yarn-dev

$(YARN_CACHE): $(YARN_INPUT) $(CACHE_DIR)
	@touch $@
	export NODE_ENV=production
	$(WEBPACK) -p $(WEBPACK_CFG)
	@touch $(YARN_DEV_CACHE)
	@rm $(YARN_DEV_CACHE)

$(JEKYLL_CACHE): $(JEKYLL_INPUT) $(CACHE_DIR)
	export JEKYLL_ENV=production
	$(JEKYLL) build
	@touch $@

$(YARN_DEV_CACHE): $(YARN_INPUT) $(CACHE_DIR)
	export NODE_ENV=development
	$(WEBPACK) $(WEBPACK_CFG) --progress
	@touch $@
	@touch $(YARN_CACHE)
	@rm $(YARN_CACHE)

update:
	$(BUNDLE) update

prod:
	export JEKYLL_ENV=production
	$(JEKYLL) serve $(SERVEOPTS)

serve:
	export JEKYLL_ENV=development
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
	mkdir $(CACHE_DIR)
