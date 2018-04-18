package main

import (
	"fmt"
	"log"

	benchstatjs "github.com/deckarep/benchstat-js"
)

var (
	a = []byte(`
BenchmarkGobEncode   	100	  13552735 ns/op	  56.63 MB/s
BenchmarkJSONEncode  	 50	  32395067 ns/op	  59.90 MB/s
BenchmarkGobEncode   	100	  13553943 ns/op	  56.63 MB/s
BenchmarkJSONEncode  	 50	  32334214 ns/op	  60.01 MB/s
BenchmarkGobEncode   	100	  13606356 ns/op	  56.41 MB/s
BenchmarkJSONEncode  	 50	  31992891 ns/op	  60.65 MB/s
BenchmarkGobEncode   	100	  13683198 ns/op	  56.09 MB/s
BenchmarkJSONEncode  	 50	  31735022 ns/op	  61.15 MB/s
	`)

	b = []byte(`
BenchmarkGobEncode   	 100	  11773189 ns/op	  65.19 MB/s
BenchmarkJSONEncode  	  50	  32036529 ns/op	  60.57 MB/s
BenchmarkGobEncode   	 100	  11942588 ns/op	  64.27 MB/s
BenchmarkJSONEncode  	  50	  32156552 ns/op	  60.34 MB/s
BenchmarkGobEncode   	 100	  11786159 ns/op	  65.12 MB/s
BenchmarkJSONEncode  	  50	  31288355 ns/op	  62.02 MB/s
BenchmarkGobEncode   	 100	  11628583 ns/op	  66.00 MB/s
BenchmarkJSONEncode  	  50	  31559706 ns/op	  61.49 MB/s
BenchmarkGobEncode   	 100	  11815924 ns/op	  64.96 MB/s
BenchmarkJSONEncode  	  50	  31765634 ns/op	  61.09 MB/s
	`)
)

func main() {

	settings := benchstatjs.NewSettings()
	settings.HTML = true
	result, err := benchstatjs.Process(settings, a, b)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(string(result))
}
