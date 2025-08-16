# Qianwen LaTeX Makefile
LATEX = xelatex
BIBTEX = bibtex
TARGET = main
BUILDDIR = build

.PHONY: all clean pdf view help

all: pdf

pdf: $(BUILDDIR)/$(TARGET).pdf

$(BUILDDIR)/$(TARGET).pdf: $(TARGET).tex
	@mkdir -p $(BUILDDIR)
	$(LATEX) -output-directory=$(BUILDDIR) $(TARGET).tex
	@if grep -q "\\bibliography" $(TARGET).tex; then \
		$(BIBTEX) $(BUILDDIR)/$(TARGET); \
		$(LATEX) -output-directory=$(BUILDDIR) $(TARGET).tex; \
	fi
	$(LATEX) -output-directory=$(BUILDDIR) $(TARGET).tex

view: $(BUILDDIR)/$(TARGET).pdf
	@if command -v open >/dev/null 2>&1; then \
		open $(BUILDDIR)/$(TARGET).pdf; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open $(BUILDDIR)/$(TARGET).pdf; \
	fi

clean:
	@rm -rf $(BUILDDIR)
	@find . -name "*.aux" -type f -delete
	@find . -name "*.log" -type f -delete
	@find . -name "*.bbl" -type f -delete
	@find . -name "*.blg" -type f -delete
	@find . -name "*.toc" -type f -delete
	@find . -name "*.out" -type f -delete

help:
	@echo "Qianwen LaTeX Makefile"
	@echo "Available targets:"
	@echo "  pdf    - Build PDF using XeLaTeX (default)"
	@echo "  view   - Build and open PDF"
	@echo "  clean  - Remove build files"
	@echo "  help   - Show this help"
	@echo ""
	@echo "Note: Uses XeLaTeX for better Chinese support"