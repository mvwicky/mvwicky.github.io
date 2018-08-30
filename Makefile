JEKYLL=jekyll
JEKYLLSERVE=$(JEKYLL) serve
SERVEOPTS=--incremental --verbose --livereload

all: SERVEOPTS := $(SERVEOPTS) --drafts --future --unpublished
all: serve

clean:
	$(JEKYLL) clean

serve:
	$(JEKYLLSERVE) $(SERVEOPTS)

drafts: SERVEOPTS := $(SERVEOPTS) --drafts
drafts: serve

future: SERVEOPTS := $(SERVEOPTS) --future
future: serve

unpub: SERVEOPTS := $(SERVEOPTS) --unpublished
unpub: serve
