import React from "react";
import Square from "./Square.js";

export default (props) => {
  const renderSquare = j => {
    return <Square value={props.value[j]} onClick={() => props.onClick(j)} />;
  };

  return <div className="game_row">{copyp(renderSquare, 9)}</div>;
}

function copyp(func, numb) {
  var it = [];

  for (var i = 0; i < numb + 1; i++) {
    it.push(func(i));
  }

  return it;
}
