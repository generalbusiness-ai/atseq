// This probe imports the published core, never the sibling working tree.
package main

import (
	"encoding/json"
	"fmt"
	"testing/fstest"

	"github.com/generalbusiness-ai/tailapps/jsonataddl"
)

func main() {
	sources := fstest.MapFS{
		"application.sql": {Data: []byte(`
CREATE EVENT otel_event (key TEXT NOT NULL, source_position INTEGER NOT NULL);
CREATE TABLE totals (key TEXT NOT NULL, total INTEGER NOT NULL, PRIMARY KEY (key));
CREATE NORMALIZER normalize ON otlp_record USING 'folds/normalize.jsonata' EMITS otel_event;
CREATE FOLD accumulate ON otel_event USING 'folds/accumulate.jsonata' WRITES totals;
CREATE EXPORT totals AS SELECT key, total FROM totals;
`)},
		"folds/normalize.jsonata":  {Data: []byte(`{"decision":"effective","facts":[],"events":{},"tables":{}}`)},
		"folds/accumulate.jsonata": {Data: []byte(`{"decision":"effective","facts":[],"tables":{}}`)},
	}
	app, err := jsonataddl.LoadApplication(sources, ".", "atseq-probe", jsonataddl.Tailapp(), "atseq-probe-v0")
	if err != nil {
		panic(err)
	}
	result, err := app.Evaluate("normalize", jsonataddl.EvaluationInput{
		Meta:  map[string]any{"position": 1, "event_id": "probe", "event_type": "otlp_record"},
		Event: map[string]any{"id": "probe", "signal": "log", "name": "probe", "source": "demo", "time_unix_nano": nil, "observed_unix_nano": nil, "trace_id": nil, "span_id": nil, "content_digest": "probe", "record": map[string]any{}},
		Rows:  map[string]any{},
	})
	if err != nil {
		panic(err)
	}
	results := map[string]any{"nativeExample": result.Decision}
	// The facade puts the authored state-document result in one opaque fact.
	// It generates the core's required SQL topology; app authors write no SQL.
	probes := map[string]string{
		"stateFacade":       `event.record.({"decision":"effective","state":{"count":state.count + act.delta}})`,
		"ineffectiveFacade": `{"decision":"ineffective","reason":"unchanged"}`,
		"arrayAppend":       `event.record.({"decision":"effective","state":{"items":$append(state.items,act.item)}})`,
		"multiplication":    `event.record.({"decision":"effective","state":{"count":state.count * act.delta}})`,
	}
	for name, source := range probes {
		sources["folds/normalize.jsonata"] = &fstest.MapFile{Data: []byte(`{"decision":"effective","facts":[{"result":(` + source + `)}],"events":{},"tables":{}}`)}
		candidate, e := jsonataddl.LoadApplication(sources, ".", name, jsonataddl.Tailapp(), "atseq-probe-v0")
		if e != nil {
			results[name] = map[string]any{"error": e.Error()}
			continue
		}
		r, e := candidate.Evaluate("normalize", jsonataddl.EvaluationInput{
			Meta:  map[string]any{"position": 1, "event_id": "probe", "event_type": "otlp_record"},
			Event: map[string]any{"id": "probe", "signal": "log", "name": "probe", "source": "demo", "time_unix_nano": nil, "observed_unix_nano": nil, "trace_id": nil, "span_id": nil, "content_digest": "probe", "record": map[string]any{"state": map[string]any{"count": 2, "items": []any{}}, "act": map[string]any{"delta": 3, "item": "x"}}},
			Rows:  map[string]any{},
		})
		if e != nil {
			results[name] = map[string]any{"error": e.Error()}
		} else {
			results[name] = r.Facts
		}
	}
	encoded, _ := json.Marshal(results)
	fmt.Println(string(encoded))
}
