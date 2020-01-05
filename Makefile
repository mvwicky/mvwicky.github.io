SHELL:=bash
.SHELLFLAGS:=-eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

BUNDLE=bundle
EXEC=$(BUNDLE) exec
CACHE_DIR=.cache
JEKYLL=$(EXEC) jekyll

SERVEOPTS=--verbose --incremental
ALLOPTS=--drafts --unpublished --future
YARN=yarn

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

$(YARN_CACHE): $(YARN_INPUT) $(CACHE_DIR)
	export NODE_ENV=production
	$(YARN) run build
	@touch $@
	@touch $(YARN_DEV_CACHE)
	@rm $(YARN_DEV_CACHE)

$(JEKYLL_CACHE): $(JEKYLL_INPUT) $(CACHE_DIR)
	export JEKYLL_ENV=production
	$(JEKYLL) build
	@touch $@

$(YARN_DEV_CACHE): $(YARN_INPUT) $(CACHE_DIR)
	export NODE_ENV=development
	$(YARN) run dev
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
