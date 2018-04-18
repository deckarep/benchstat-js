package benchstatjs

import (
	"bytes"
	"fmt"
	"strings"

	"golang.org/x/perf/benchstat"
)

var deltaTestNames = map[string]benchstat.DeltaTest{
	"none":   benchstat.NoDeltaTest,
	"u":      benchstat.UTest,
	"u-test": benchstat.UTest,
	"utest":  benchstat.UTest,
	"t":      benchstat.TTest,
	"t-test": benchstat.TTest,
	"ttest":  benchstat.TTest,
}

var sortNames = map[string]benchstat.Order{
	"none":  nil,
	"name":  benchstat.ByName,
	"delta": benchstat.ByDelta,
}

var DefaultSettings = &Settings{
	Alpha:     0.5,
	DeltaTest: "utest",
	Sort:      "none",
	Split:     "pkg,goos,goarch",
}

// NewSettings creates a new setting from default.
func NewSettings() *Settings {
	// Structwise copy of the settings
	settings := *DefaultSettings
	return &settings
}

// Settings are the possible settings to tweak the output of benchstatjs.
type Settings struct {
	DeltaTest string
	Alpha     float64
	Geomean   bool
	HTML      bool
	Split     string
	Sort      string
}

// Process executes a benchstat with settings against one or more input blobs.
func Process(settings *Settings, blobs ...[]byte) ([]byte, error) {
	deltaTest := deltaTestNames[strings.ToLower(settings.DeltaTest)]
	sortName := settings.Sort
	reverse := false
	if strings.HasPrefix(sortName, "-") {
		reverse = true
		sortName = sortName[1:]
	}
	order, ok := sortNames[sortName]

	if deltaTest == nil || !ok {
		return nil, fmt.Errorf("Failed to init with proper settings")
	}

	c := &benchstat.Collection{
		Alpha:      settings.Alpha,
		AddGeoMean: settings.Geomean,
		DeltaTest:  deltaTest,
	}
	if settings.Split != "" {
		c.SplitBy = strings.Split(settings.Split, ",")
	}
	if order != nil {
		if reverse {
			order = benchstat.Reverse(order)
		}
		c.Order = order
	}
	for i, file := range blobs {
		c.AddConfig(fmt.Sprintf("file-%d", i), file)
	}

	tables := c.Tables()
	var buf bytes.Buffer
	if settings.HTML {
		buf.WriteString(htmlHeader)
		benchstat.FormatHTML(&buf, tables)
		buf.WriteString(htmlFooter)
	} else {
		benchstat.FormatText(&buf, tables)
	}

	return buf.Bytes(), nil
}

var htmlHeader = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Performance Result Comparison</title>
<style>
.benchstat { border-collapse: collapse; }
.benchstat th:nth-child(1) { text-align: left; }
.benchstat tbody td:nth-child(1n+2):not(.note) { text-align: right; padding: 0em 1em; }
.benchstat tr:not(.configs) th { border-top: 1px solid #666; border-bottom: 1px solid #ccc; }
.benchstat .nodelta { text-align: center !important; }
.benchstat .better td.delta { font-weight: bold; }
.benchstat .worse td.delta { font-weight: bold; color: #c00; }
</style>
</head>
<body>
`
var htmlFooter = `</body>
</html>
`
