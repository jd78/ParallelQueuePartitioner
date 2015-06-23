SERVICETESTS = $(shell find ./Test/Services/* -name "*.js")
APPLICATIONTESTS = $(shell find ./Test/Application/* -name "*.js")
	
unit-test:
	@echo "Running middleware tests..."
	mocha $(SERVICETESTS)
	mocha $(APPLICATIONTESTS)
	
all: unit-test
unit-tests: unit-test