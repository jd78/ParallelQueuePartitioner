SERVICETESTS = $(shell find ./Test/Services/* -name "*.js")
	
unit-test:
	@echo "Running middleware tests..."
	mocha $(SERVICETESTS)
	
all: unit-test
unit-tests: unit-test