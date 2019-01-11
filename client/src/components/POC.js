import React, { Component } from "react";

class POC extends Component {
  constructor() {
    super();
    this.state = {
      api: "http://localhost:8000",
      query: "",
      operation: null
    };
  }

  async handleSubmit() {
    const { query } = this.state;
    const response = await fetch(`${this.state.api}/api`);
    const id = response.headers.get("X-Execution-ID");
    console.log("handleSubmit:setState 1");
    this.setState({ operation: { id, query, running: true } });
    const result = await response.text();
    console.log("handleSubmit:setState 2");
    this.setState({
      operation: { id, query, result, running: false, state: "finished" }
    });
  }

  async handleAbort() {
    const id = this.state.operation && this.state.operation.id;
    if (!id) return;
    console.log("handleAbort:fetch");
    const response = await fetch(`${this.state.api}/abort?id=${id}`);
    await response.text();
    console.log("handleAbort:setState 1");
    this.setState({ operation: { id, running: false, state: "aborted" } });
  }

  render() {
    const { state } = this;
    const isRunning = state.operation && state.operation.running;
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          this.handleSubmit();
        }}
      >
        <samp>
          <input
            className="m-2"
            placeholder="api url"
            value={state.api}
            onChange={({ target: { value } }) => this.setState({ api: value })}
          />
          <br />
          <textarea
            className="m-2"
            placeholder="query"
            value={state.query}
            onChange={({ target: { value } }) =>
              this.setState({ query: value })
            }
          />
          <br />
          <button className="m-2 p-2 code" disabled={isRunning}>
            SUBMIT
          </button>
          <br />
          <button
            type="button"
            className="m-2 p-2"
            disabled={!isRunning}
            onClick={() => this.handleAbort()}
          >
            ABORT
          </button>

          {state.operation && (
            <pre>
              {state.operation.state || "running"}!{"\n"}operation id:{" "}
              {state.operation.id}
            </pre>
          )}
          {state.operation && state.operation.state === "finished" && (
            <pre>
              finished!{"\n"}operation id: {state.operation.id}
              {"\n"}result: {state.operation.result}
            </pre>
          )}
        </samp>
      </form>
    );
  }
}

export default POC;
