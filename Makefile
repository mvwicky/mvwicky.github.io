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
WEBPACK_CFG_FILE=webpack.config.ts
WEBPACK_CFG=--config $(WEBPACK_CFG_FILE)

WATCHEXEC=watchexec
WATCH_OPTS=-w src -w $(WEBPACK_CFG_FILE) -p -d 1000

YARN_INPUT=$(shell find src -type f) $(WEBPACK_CFG_FILE) package.json yarn.lock
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

$(YARN_CACHE): export NODE_ENV=production
$(YARN_CACHE): $(YARN_INPUT) $(CACHE_DIR)
	@touch $@
	$(WEBPACK) -p $(WEBPACK_CFG)
	@touch $(YARN_DEV_CACHE)
	@rm $(YARN_DEV_CACHE)

$(JEKYLL_CACHE): export JEKYLL_ENV=production
$(JEKYLL_CACHE): $(JEKYLL_INPUT) $(CACHE_DIR)
	$(JEKYLL) build
	@touch $@

$(YARN_DEV_CACHE): export NODE_ENV=development
$(YARN_DEV_CACHE): $(YARN_INPUT) $(CACHE_DIR)
	$(WEBPACK) $(WEBPACK_CFG) --progress
	@touch $@
	@touch $(YARN_CACHE)
	@rm $(YARN_CACHE)

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
	mkdir $(CACHE_DIR)
