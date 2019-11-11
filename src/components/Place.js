import React, { Component } from "react";
import Width from "./Width.js";

function NomerWi(props) {
  return <div>{many("А", "Й")}</div>;
}

function NomerHi(props) {
  return <div className="game_up">
           {many("/", "9")}
         </div>;
}

export default (props) => {
  const renderWidth = i => {
    return (
      <Width value={props.value[i]} onClick={j => props.onClick(i, j)} />
    );
  };

  return (
    <div className="game_row">
      <div className="game_up">{NomerHi()}</div>
      <div className="game_up">
        {NomerWi()}
        {copyp(renderWidth, 9)}
      </div>
    </div>
  );
}


function many(a, b) {
  var a_cod = a.charCodeAt(0);
  var b_cod = b.charCodeAt(0);
  var difference = b_cod - a_cod;
  var it = [];

  for (var i = 0; i < difference + 1; i++) {
    var cod = a_cod + i;
    var sign = String.fromCharCode(cod);
    if (i == difference) sign = b;
    it.push(<button className="square text_sq">
    {sign}
    </button>);
  }

  return it;
}

function copyp(func, numb) {
  var it = [];

  for (var i = 0; i < numb + 1; i++) {
    it.push(func(i));
  }

  return it;
}
