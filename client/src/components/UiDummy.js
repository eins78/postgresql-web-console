import React, { Component } from "react";

class Dummy extends Component {
  render() {
    return (
      <div class="container">
        <div class="alert alert-danger" role="alert">
          <b>
            <i class="glyphicon glyphicon-warning-sign" />
          </b>

          <span style={{ whiteSpace: "pre" }}>
            Alpha Feature, use at your own risk! It should NOT be enabled on
            productions systems! Queries will be run in a rolled-back
            transaction, but apart from that there are no security measures
            preventing misuse!
          </span>
        </div>
        <div class="page-header">
          <h1>
            <i class="glyphicon glyphicon-education" />
            SQL Reports
          </h1>
          <small>
            <a href="/admin/assistant">← Go back to Assistant page</a>
          </small>
        </div>
        <div class="row">
          <form
            action="/admin/assistant/sql_reports"
            accept-charset="UTF-8"
            method="get"
          >
            <input name="utf8" type="hidden" value="✓" />
            <div class="col-xs-12">
              <div
                id="sql_reports_query_show"
                style={{ marginBottom: "35px", display: "none" }}
              >
                <p
                  style={{
                    padding: "1.5em",
                    marginBottom: 0,
                    whiteSpace: "pre-wrap",
                    border: "1px solid transparent"
                  }}
                >
                  <samp style={{ overflowWrap: "break-word" }}>SELECT 1</samp>
                </p>
              </div>
              <p id="sql_reports_query_edit" style={{ display: "block" }}>
                <textarea
                  name="query"
                  id="query"
                  class="well code"
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "1.5em",
                    marginBottom: "20px"
                  }}
                >
                  SELECT 1
                </textarea>
              </p>
              <input
                type="submit"
                name="run"
                value="Run Query"
                class="btn btn-success"
                data-disable-with="Running…"
              />
              <input
                type="submit"
                name="do"
                value="Edit"
                class="btn btn-default"
                id="sql_reports_edit_button"
                disabled="disabled"
              />
            </div>
          </form>
        </div>
        <hr style={{ marginTop: "30px" }} />
      </div>
    );
  }
}

export default Dummy;
