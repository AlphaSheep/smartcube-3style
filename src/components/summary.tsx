import React from "react";

import { useAppSelector } from "../state/hooks";
import { selectTrainerResults } from "../state/trainer.duck";
import { Move, simplifyAlg } from "../lib/cube/cube";

export default function Summary() {
  const results = useAppSelector(selectTrainerResults);
  let sortedResults = [...results].sort((a, b) => (b.time || Infinity) - (a.time || Infinity));

  return <div className="summary">
    {results.length > 0 ?
      <table>
        <thead>
          <tr>
            <th>Prompt</th>
            <th>Total time</th>
            <th>Recognition time</th>
            <th>Execution time</th>
            <th>Algorithm</th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result, index) => <tr>
            <td>{result.prompt}</td>
            <td>{result.time ? result.time/1000 : "skipped"}</td>
            <td>{result.recognitionTime ? result.recognitionTime/1000 : "--"}</td>
            <td>{(result.time && result.recognitionTime) ? (result.time - result.recognitionTime)/1000 : "--"}</td>
            <td>{simplifyAlg(result.moves.map(move => new Move(move.move))).join(" ")}</td>
          </tr>)}
        </tbody>
      </table>
    : null}
  </div>
}