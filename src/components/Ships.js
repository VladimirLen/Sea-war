import React from "react";

 export default (props) => {
  let prop = props.value - 1;

  const ship = (i) => {
    let bord = <img src="1.png" width="100%" />;
    return <div className="cell">{bord}</div>;
  };


  return (
    <button  className="dame shadow_out" onClick={() => {
      props.onClick();
    }}>
      {copyp(ship, props.value - 1)}
    </button>
  );
}

function copyp(func, numb) {
  var it = [];

  for (var i = 0; i < numb + 1; i++) {
    it.push(func(i));
  }

  return it;
}
