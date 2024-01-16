import React from "react";

import { useAppSelector } from "../state/hooks";
import { selectTrainerResults } from "../state/trainer.duck";
import { Move, simplifyAlg } from "../lib/cube/cube";

import './summary.less';

export default function Summary() {
  const results = useAppSelector(selectTrainerResults);
  let sortedResults = [...results].sort((a, b) => (b.time || Infinity) - (a.time || Infinity));

  return <div className="summary">
    {results.length > 0 ?
      <>
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
            {sortedResults.map((result, index) => <tr key={result.prompt}>
              <td>{result.prompt}</td>
              <td>{result.time ? formatTime(result.time) : "skipped"}</td>
              <td>{result.recognitionTime ? formatTime(result.recognitionTime) : "--"}</td>
              <td>{formatTime(calcExecTime(result.time, result.recognitionTime))}</td>
              <td>{simplifyAlg(result.moves.map(move => new Move(move.move))).join(" ")}</td>
            </tr>)}
          </tbody>
        </table>
        <br/>
      </>
    : null}
  </div>
}

function calcExecTime(totalTime: number | null, recognitionTime: number | null): number {
  if (!totalTime || !recognitionTime) {
    return 0;
  }
  if (recognitionTime > totalTime) {
    totalTime;
  }
  return totalTime - recognitionTime;
}

function formatTime(time: number): string {
  if (!time || time === Infinity || time < 0) {
    return "--";
  }

  return (time / 1000).toFixed(2);
}