import React, { Component } from "react";
import '../styles/App.css';
import Place from "./Place.js";
import Ships from "./Ships.js";
import Loader from "./Loader.js";


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.socket = io();
    this.picture = {
      sea: <img src="sea.png" width="100%"/>,
      ship: <img src="1.png" width="100%"/>,
      shot: <img src="shot.png" width="100%"/>,
      ship_fire: <img src="2.png" width="100%"/>,
      ship_debris: <img src="3.png" width="100%"/>
    }
    this.state = {
      squares1: onClone(Array(10).fill(this.picture.sea), 10),
      squares_enemy: '',
      shot1: onClone(Array(10).fill(this.picture.sea), 10),
      sphipNomber1: Array(5).fill(0),
      position: {},
      position_enemy: '',
      stateShip: '',
      orientation: true,
      ships_ready: false,
      enemy_ready: false, //противник найден
      i_ready: false,
      move: false, // стaтус хода игрока
      temporary: [[0],[1,2,3,4],[1,2,3],[1,2],[1]],
      status: false,
      name: 'name',  //имя игрока
      fitst_page: false,
      count: 0
    };
  }

  cellPoint (locate, cell, squares, state)  {

    for (var h = 0; h < locate.length; h++) {
        squares[locate[h][0]][locate[h][1]] = cell;
    }

    this.setState ({[state]: squares});
  }

  orientation() {
    const orientation = this.state.orientation;
    let hh, ww; //hh - вертикально ww-горизонтально

    if (orientation) {
      hh = 0;
      ww = 1;
    }

    if (!orientation) {
      hh = 1;
      ww = 0;
    }

    return [hh, ww];
  }

  //возвращает маассик координат корабля
  locate_Ship( i, j, stateShip) {
    //hh - вертикально ww-горизонтально
    let [hh, ww] = this.orientation();
    let squares = [];

    for (let k = 0; k < stateShip; k++) {
      squares.push([i + k*hh, j + k*ww]);
    }

    return squares;
  }
  //проверяет наличие наличие кораблей рядом
  check_around( locate, squares, cell) {

    for (var k = 0; k < locate.length; k++) {
      for (var h = 0; h < 3; h++) {
        for (var w = 0; w < 3; w++) {
          let x = locate[k][0] - 1 + h;
          let y = locate[k][1] - 1 + w;
          // если 'x' выходит за граници поля, пропустить
          if (x < 0 || x > 9 || y < 0 || y > 9) continue;

          let squ = cell ? (squares[x][y]['props']['src'] == cell['props']['src']) : squares[x][y];
          if (squ) return true;
        }
      }
    }
  }

  count_Ship( stateShip, count) {
    let sphipNomber1 = this.state.sphipNomber1.slice();
    let sphipExaple = [0, 5, 4, 3, 2];
    sphipNomber1[stateShip] += count;
    if (sphipNomber1[stateShip] == sphipExaple[stateShip]) return true;

    this.setState({sphipNomber1: sphipNomber1});
  }

  onLocate_ship(i, j) {
    if (this.state.ships_ready) return;
    let squares1 = onClone(this.state.squares1);
    const orientation = this.state.orientation;
    const stateShip = this.state.stateShip;
    let temporary = this.state.temporary;
    //если длина корабля выходит за пределы поля
    this.change_location(i,j);
    if (!orientation && i + stateShip > 10 || orientation && j + stateShip > 10) return;

    let locate = this.locate_Ship( i, j, stateShip);
    //условия
    if (this.check_around(locate, squares1, this.picture.ship)) return; //проверка окружения вокруг корабля
    if (this.count_Ship( stateShip, 1)) return; //счетчик кораблей

    let temp = temporary[stateShip].splice(0,1);
    let picture = <img src="1.png" value={(stateShip + '.' + temp)} width="100%"/>;
    this.cellPoint( locate, picture, squares1, 'squares1');
    //записываем координаты кораблеq
    let coordinats = this.state.position;
    coordinats[stateShip + '.' + temp] = locate;
    this.setState({position: coordinats});
  }
  // изменить положение кораблей
  change_location(i,j) {
    let squares1 = onClone(this.state.squares1);
    if (squares1[i][j]['props']['src'] == this.picture.sea['props']['src']) return;
    let position = this.state.position;
    let sphipNomber1 = this.state.sphipNomber1.slice();
    let val = (squares1[i][j]['props']['value']).split('.');
    let temporary = this.state.temporary;

    this.cellPoint (position[val.join('.')], this.picture.sea, squares1, 'squares1');
    this.count_Ship( val[0], -1);
    temporary[val[0]].push( val[1]);
  }
//выстрелы по врагу
  onShot_ship(i, j) {
    if (!this.state.enemy_ready) return;
    if (!this.state.ships_ready) return;
    if (!this.state.i_ready) return;
    if (!this.state.move) return;
    let squares = onClone(this.state.squares_enemy);
    let position = this.state.position_enemy;
    let shot1 = onClone(this.state.shot1);
    let  squ = squares[i][j]['props']['value'];
    let cell = this.picture.shot;
    let src_1 = squares[i][j]['props']['src'];
    let src_2 = this.picture.ship['props']['src'];

    if ( src_1 == src_2) {
      cell = this.picture.ship_fire;
    } else this.setState({move: false});


    this.cellPoint( [[i,j]], cell, shot1, 'shot1');
    this.socket.emit('shot', [[i, j]], src_1 == src_2 ? 2 : 1);
    if ( this.check_position( position[squ], shot1, cell)) {
      this.cellPoint( position[squ], this.picture.ship_debris, shot1, 'shot1');
      this.socket.emit('shot', position[squ], 3);
      this.setState({count: this.state.count + 1});
      if (this.state.count == 9) {
        alert('!!!Вы победили!!!');
        this.socket.emit('winner', true);
      };
    }
  }

  check_position( locate, squares, cell) {
    let status = true;
    for (let i = 0; i < locate.length; i++) {
      if (squares[locate[i][0]][locate[i][1]]['props']['src'] !== cell['props']['src']) status = false;
    }
    return status;
  }

  onShips(i) {
    this.setState({stateShip: i});
  }

  renderPlace1() {
    return <Place value={this.state.squares1} onClick={(i, j) => this.onLocate_ship(i, j)} />;
  }

  renderPlace2() {
    return <Place value={this.state.shot1} onClick={(i, j) => this.onShot_ship(i, j)} />;
  }

  onPosition() {
    const position = !this.state.orientation;

    this.setState({orientation: position});
  }

  onStatus() {
    if (this.state.move) return;
    this.socket.emit('change_hod', true);
    this.setState({status: false});
  }

  onStart() {
    if (this.state.sphipNomber1.join() == [0,4,3,2,1].join()) {
      this.setState({ships_ready: true});
      this.socket.emit('i_ready', true);
    } else alert('Расставьте корабли');
  }

  handleChange(event) {
    this.setState({ name: event.target.value });
  }

  page() {
    let name = this.state.name;

    if (name == '' || name.length < 5) {
      alert('Введите имя больше 4 символов');
      return;
    }

    this.setState({fitst_page: true});
  }


  componentDidMount() {
    let band = this;
    //присоединился игрок
    this.socket.emit('player1', true);
    //кто ходит первый а кто вторым
    this.socket.on('1_hod', function(tru) {
      band.setState({move: tru, status: tru});
    });
    //противник есть
    this.socket.on('enemy', function(tru) {
      band.setState({enemy_ready: tru});
    });
    //получаем координаты противника
    this.socket.on('coordinats', function(hostile, bordship) {
      band.setState({squares_enemy: hostile, position_enemy: bordship});
    });
    //обновление выстрелов
    this.socket.on('shot', function( x, value) {
      let squares1 = onClone(band.state.squares1);
      let ship_fire = (value == 1) ? band.picture.shot :
                      (value == 2) ? band.picture.ship_fire :
                      band.picture.ship_debris;

      band.cellPoint( x, ship_fire, squares1, 'squares1');
    });
    // противник готов
    this.socket.on('i_ready', function(x) {
      band.setState({i_ready: x});
    });
    this.socket.on('winner', function(x) {
      alert('Вы проиграли :(');
    });
  }

  firstPage() {
      if (!this.state.fitst_page) {
      return (
        <div className="first_page">
          <div class="center">
            <input
              id="user1"
              className="buttons_first game_row shadow_in text_but_first"
              type="text"
              value={this.state.name}
              onFocus={() => this.setState({name: ''})}
              onChange={(event) => this.handleChange(event)}
            />
            <button class="buttons_first game_row text_but_first" onClick={() => this.page()}>
              START
            </button>
          </div>
        </div>
      );
    } else return null;
  }

  load_page() {
    if (this.state.enemy_ready) {
      this.socket.emit('coordinats', this.state.squares1 , this.state.position);
      return null;
    } else return (<Loader />);
  }

  buttonShip() {
    if (!this.state.ships_ready) {
      return(
        <div>
          <Ships value={1} onClick={() => this.onShips(1)} />
          <Ships value={2} onClick={() => this.onShips(2)} />
          <Ships value={3} onClick={() => this.onShips(3)} />
          <Ships value={4} onClick={() => this.onShips(4)} />
        </div>
      );
    } else return null;
  }

  pultButton() {
    return (
      <div>
        {this.buttonShip()}
        <div>
        <button className="buttons dame text_but" onClick={() => this.onPosition()}>
          {this.state.orientation ? 'Горизонтально' : 'Вертикально'}
        </button>
        <button className="buttons dame text_but" onClick={() => this.onStart()}>
          {'Start'}
        </button>
        <button className="buttons dame text_but" onClick={() => this.onStatus()}>
          {'Передать ход'}
      </button>
      </div>
    </div>);
  }

  hod() {
    let value;
    value = this.state.status ? 'Ходит:' + this.state.name : 'Ходит:' + 'Противник';
    if (!this.state.enemy_ready) {
      value = '__Противник не найден__';
    };
    if (!this.state.i_ready && this.state.enemy_ready) {
      value = '__Противник расставляет корабли__';
    };
    return(<h2>{value}</h2>);
  }

  valley() {
    if (this.state.fitst_page) {
      return(
        <div>
          <div class="dame text_sq">{this.hod()}</div>
          <div>
          <div className="game_row_med">
              {this.renderPlace1()}
              {this.pultButton()}
              {this.renderPlace2()}
            </div>
          </div>
        </div>
      );
    } else return null;
  }

  render() {
    return (
      <div>
        {this.valley()}
        {this.load_page()}
        {this.firstPage()}
      </div>
    );
  }
}
export default Game;

function onClone(word, b) {
  var a = [];
  var leng = word.length;
  if (b) leng = b;

  for (var i = 0; i < leng; i++) {
    var w = word[i];
    if (b) w = word;
    a.push(w.slice());
  }

  return a;
}
