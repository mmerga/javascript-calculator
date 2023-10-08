import React from 'react'
import ReactDOM from 'react-dom';
import * as mathjs from "https://cdn.skypack.dev/mathjs@11.8.0";
import { FiDelete } from 'react-icons/fi';

const INIT_VALUE = '0';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayTop: INIT_VALUE, ////--------------- controls history of entry
      displayBot: INIT_VALUE, ////--------------- actual entry
      previousResult: INIT_VALUE, ////--------------- save last result, so i can use on next expressions
      result: false,  ////--------------- tell me if there is old result saved
    }; 
    this.elementRefs = []; // refs to buttons 
  }
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\ 
  // some entry restrictions
  componentDidUpdate(prevProps, prevState) {    
    if (prevState.displayBot == '0' && this.state.displayBot == '00') { ////--------------- Remove 0 when 0 is insert
      this.setState({
        displayTop: prevState.displayTop,
        displayBot: INIT_VALUE
      });
    }else if (prevState.displayBot == '0' && this.state.displayBot == '0') {  ////--------------- Do nothing on Reset
      // DO NOTHING //
    }else if (prevState.displayBot == '0' && this.state.displayBot != '0.') { ////--------------- Remove first 0
      this.setState({
        displayTop: this.state.displayTop.replace(/0/g, ''),
        displayBot: this.state.displayBot.replace(/0/g, '')
      });     
    }
    if( (/[/+*-]{2}$/.test(prevState.displayTop)) && !(/\d$/.test(this.state.displayTop)) ) { ////--------------- Remove Previus simbol if two of then are insert, exept '-', minus
      // 5 * - + 5  should be  10   ----  5 * - 5  should be -25
      let newState = prevState.displayTop.split("");
      newState[newState.length-2] = "";
      newState[newState.length-1] = "";
      newState = newState.join("");
      let aux = this.state.displayTop.split("");
      newState = newState + aux[aux.length-1];
      this.state.displayTop = newState;
    }
    if(this.state.result == false){  ////--------------- handler two dots 
      const firstPosition = this.state.displayBot.indexOf('.');
      if(firstPosition !== -1){
        const secondPosition = this.state.displayBot.indexOf('.', firstPosition + 1);
        if(secondPosition !== -1){
          this.setState({
            displayTop: prevState.displayTop,
            displayBot: prevState.displayBot,
            result: false
          });
        }
      }
    }
  }
/////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  // when i click on a matching character
  // should i be able to do maths with keyboard
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    try{
      if(event.key == ","){
        const key = '.';
        for (let index = 0 ;index < this.elementRefs.length ; index ++) {
          if(this.elementRefs[index].textContent == key){
            this.elementRefs[index].click();
          }
        }
      }else if(event.key === ' '){
        for (let index = 0 ;index < this.elementRefs.length ; index ++) {
          if(this.elementRefs[index].textContent === 'AC'){
            this.elementRefs[index].click();
          } 
        }
      }else if(event.key == "Backspace"){
        for (let index = 0 ;index < this.elementRefs.length ; index ++) {
          if(this.elementRefs[index].textContent === ''){
            this.elementRefs[index].click();
          } 
        }
      }else if(event.key == 'Enter'){
        const key = '=';
        for (let index = 0 ;index < this.elementRefs.length ; index ++) {
          if(this.elementRefs[index].textContent == key){
            this.elementRefs[index].click();
          }
        }
      }else{
        for (let index = 0 ;index < this.elementRefs.length ; index ++) {
          if(this.elementRefs[index].textContent == event.key){
            this.elementRefs[index].click();
          }
        }
      }
    }catch (error) {
      //console.log({error});
    }
  }
 /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\   
  handleReset = () => {
    this.setState((prevState) => (
      { 
        displayTop: INIT_VALUE,
        displayBot: INIT_VALUE, 
        previousResult: INIT_VALUE,
        result: false
      }
    ));
  }
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleDelete = () => {
    if(this.state.result == false){
      this.setState((prevState) =>  {
        if(this.state.displayBot.length === 1){
          return (
            {
              displayTop: INIT_VALUE,
              displayBot: INIT_VALUE,
            }
          );
        }else{
          return (
            {
              displayTop: prevState.displayTop.slice(0,-1),
              displayBot: prevState.displayBot.slice(0,-1),
            }
            );
          }
        });
    }
  }
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleEquals = () => { 
    if(this.state.result == false){
      try {
        const resultado = mathjs.evaluate(this.state.displayTop);
        this.setState((prevState) =>  (
          { 
            displayTop: prevState.displayTop + '= ' + resultado,
            displayBot: resultado,
            previousResult: resultado,
            result: true
          }
        ));
      } catch (error) {
        //console.error({error, message: 'not a valid entry'});
        this.setState((prevState) =>  (
          { 
            displayTop: INIT_VALUE,
            displayBot: 'FATAL ERROR NOT A VALID ENTRY',
            previousResult: INIT_VALUE,
            result: false
          }
        ));

      }
    }else{
      try {
        this.setState((prevState) => (
          {
            displayTop: prevState.displayTop,
            displayBot: prevState.displayBot,
            previousResult: prevState.previousResult,
            result: true
          }
        ));
      } catch (error) {
        //console.error({error, message: 'not a valid entry'});
        this.setState((prevState) =>  (
          { 
            displayTop: INIT_VALUE,
            displayBot: 'FATAL ERROR NOT A VALID ENTRY',
            previousResult: INIT_VALUE,
            result: false
          }
        ));
      }
    }
  }
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleFloat = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '.',
          displayBot: prevState.displayBot + '.' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '0.',
          displayBot: '0.',
          result: false
        }
      ));
    }
  }
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleDivide = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '/',
          displayBot: '/' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: this.state.previousResult + '/',
          displayBot: '/' ,
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleMultiply = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '*',
          displayBot: '*' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: this.state.previousResult + '*',
          displayBot: '*' ,
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleAdd = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '+',
          displayBot: '+' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: this.state.previousResult + '+',
          displayBot: '+' ,
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleSubtract = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '-',
          displayBot: '-' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: this.state.previousResult + '-',
          displayBot: '-', 
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleNine = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '9',
          displayBot: prevState.displayBot + '9' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '9',
          displayBot: '9',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleEight = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '8',
          displayBot: prevState.displayBot + '8' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '8',
          displayBot: '8',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleSeven = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '7',
          displayBot: prevState.displayBot + '7' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '7',
          displayBot: '7',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleSix = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '6',
          displayBot: prevState.displayBot + '6' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '6',
          displayBot: '6',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleFive = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '5',
          displayBot: prevState.displayBot + '5' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '5',
          displayBot: '5',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleFour = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '4',
          displayBot: prevState.displayBot + '4' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '4',
          displayBot: '4',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleThree = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '3',
          displayBot: prevState.displayBot + '3' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '3',
          displayBot: '3',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleTwo = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '2',
          displayBot: prevState.displayBot + '2' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '2',
          displayBot: '2',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleOne = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '1',
          displayBot: prevState.displayBot + '1' 
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '1',
          displayBot: '1',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  handleZero = () => {
    if(this.state.result == false){
      this.setState((prevState) => (
        { 
          displayTop: prevState.displayTop + '0',
          displayBot: prevState.displayBot + '0'
        }
      ));
    }else{
      this.setState((prevState) => (
        { 
          displayTop: '0',
          displayBot: '0',
          result: false
        }
      ));
    }
  };
  /////////////////////////////----------------------\\\\\\\\\\\\\\\\\\\\\\\\\\\  
  render() {
    return (
      <div id="calculator">
        <h1>Calculator</h1>
        <div id="display-wrapper">
          <section  className="display-top">{this.state.displayTop}</section>
          <section id="display" className="display-bot">{this.state.displayBot}</section>
        </div>
        <table>
          <tbody>
            <tr>
              <td id="clear" className="btn-danger" accessKey=' ' onClick={this.handleReset} ref={(element) => this.elementRefs.push(element)}>AC</td>
              <td id="delete" className="btn-warning" accessKey='backspace' onClick={this.handleDelete} ref={(element) => this.elementRefs.push(element)}><FiDelete /></td>
              <td id="divide" className="btn-dark" accessKey='/' onClick={this.handleDivide} ref={(element) => this.elementRefs.push(element)}>/</td>
              <td id="multiply" className="btn-dark" accessKey='*' onClick={this.handleMultiply} ref={(element) => this.elementRefs.push(element)}>*</td>
            </tr>
            <tr>
              <td id="seven" className="btn-secondary" accessKey='7' onClick={this.handleSeven} ref={(element) => this.elementRefs.push(element)}>7</td>
              <td id="eight" className="btn-secondary" accessKey='8' onClick={this.handleEight} ref={(element) => this.elementRefs.push(element)}>8</td>
              <td id="nine" className="btn-secondary" accessKey='9' onClick={this.handleNine} ref={(element) => this.elementRefs.push(element)}>9</td>
              <td id="subtract" className="btn-dark" accessKey='-' onClick={this.handleSubtract} ref={(element) => this.elementRefs.push(element)}>-</td>
            </tr>
            <tr>
              <td id="four" className="btn-secondary" accessKey='4' onClick={this.handleFour} ref={(element) => this.elementRefs.push(element)}>4</td>         
              <td id="five" className="btn-secondary" accessKey='5' onClick={this.handleFive} ref={(element) => this.elementRefs.push(element)}>5</td>
              <td id="six" className="btn-secondary" accessKey='6' onClick={this.handleSix} ref={(element) => this.elementRefs.push(element)}>6</td>
              <td id="add" className="btn-dark" accessKey='+' onClick={this.handleAdd} ref={(element) => this.elementRefs.push(element)}>+</td>
            </tr>
            <tr>
              <td id="one" className="btn-secondary" accessKey='1' onClick={this.handleOne} ref={(element) => this.elementRefs.push(element)}>1</td>         
              <td id="two" className="btn-secondary" accessKey='2' onClick={this.handleTwo} ref={(element) => this.elementRefs.push(element)}>2</td>
              <td id="three" className="btn-secondary" accessKey='3' onClick={this.handleThree} ref={(element) => this.elementRefs.push(element)}>3</td>
              <td id="equals" className="btn-success" accessKey='enter' onClick={this.handleEquals} rowSpan="2" ref={(element) => this.elementRefs.push(element)}>=</td>
              <td style={{'display': 'none'}} accessKey='=' ref={(element) => this.elementRefs.push(element)}>=</td>
            </tr>
            <tr>
              <td id="zero" className="btn-secondary" accessKey='2' onClick={this.handleZero} colSpan="2" ref={(element) => this.elementRefs.push(element)}>0</td>         
              <td id="decimal" className="btn-secondary" accessKey=',' onClick={this.handleFloat} ref={(element) => this.elementRefs.push(element)}>.</td>         
              <td style={{'display': 'none'}} accessKey='.' ref={(element) => this.elementRefs.push(element)}>.</td>         
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', function () {
    const MyApp = <App />;    
    ReactDOM.render(MyApp, document.getElementById('wrapper'));
});
  
