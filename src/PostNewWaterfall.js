import React, {Component} from 'react'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import './App.css'

class ImperialMeasurement extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.onUpdate = props.onUpdate
  }

  static realType = {
    feet: 'integer',
    inches: 'integer'
  }


  handleChange(event) {
    const target = event.target
    const name = target.name
    let value = null
    if (typeof target.value === 'string' && target.value.trim().length === 0) {
      value = '';
    } else if (target.type === 'checkbox') {
      value = target.checked;
    } else if (typeof target.value === 'string' && ImperialMeasurement.realType[name] === 'integer') {
      value = parseInt(target.value);
    } else if (typeof target.value === 'string' && ImperialMeasurement.realType[name] === 'float') {
      value = parseFloat(target.value);
    }

    this.onUpdate(name, value)

  }

  render() {
    return (
      <div className="imperialMeasurement">
        <label>Feet:
          <input type="number" name="feet" maxLength={32}
                 value={this.props.value.feet}
                 onChange={this.handleChange}/>
        </label>
        <label>Inches:
          <input type="number" name="inches" maxLength={32}
                 value={this.props.value.inches}
                 onChange={this.handleChange}/>
        </label>
        PROPS: ${JSON.stringify(this.props)}
      </div>
    )
  }
}



class PostNewWaterfall extends React.Component {

  static realType = {
    name: 'string',
    latitude: 'float',
    longitude: 'float',
    cubicFeetPerMinute:: 'float',
    height: {
      feet: 'integer',
      inches:'integer'
    }
  }

  static defaultState() {
    return {
      name: '',
      latitude: '',
      longitude: '',
      cubicFeetPerMinute: '',
      height: {
        feet: '2',
        inches:''
      }
    }
  };

  static removeEmpty(obj) {
    return Object.keys(obj)
      .filter(k => obj[k] !== null && obj[k] !== undefined && (typeof obj[k] !== 'string' || obj[k].trim().length > 0))  // Remove undef. and null.
      .reduce((newObj, k) => {
        if (typeof obj[k] === 'object') {
          const reducedObj = PostNewWaterfall.removeEmpty(obj[k]) // Recurse.
          if (Object.keys(reducedObj).length !== 0) {
            Object.assign(newObj, {[k]: reducedObj})
          }
        } else {
          Object.assign(newObj, {[k]: obj[k]})  // Copy value.
        }
        return newObj;
      }, {});
  }

  constructor(props) {
    super(props)
    if (props.postNewWaterfall) {
      this.state = props.postNewWaterfall;
    } else {
      this.state = PostNewWaterfall.defaultState()
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resetValues = this.resetValues.bind(this);
  }

  resetValues() {
    this.setState(PostNewWaterfall.defaultState())
  }

  updateChildProperty(name) {
    return (key, value) => {
      const current = this.state[name];
      current[key] = value;
      this.setState({[name]:current})
      console.log("Update Child Property:" + JSON.stringify(this.state))
    }
  }

  handleChange(event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      [name]: value
    }, () => console.log("Update Property:" + JSON.stringify(this.state)))

  }

  handleSubmit(event) {
    event.preventDefault()

    const prunedState = PostNewWaterfall.removeEmpty(this.state)
    console.log('A name was submitted: ' + JSON.stringify(prunedState))
    fetch('http://localhost:8080/waterfall', {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(prunedState)
    }).then(resp => this.setState(this.defaultState()))
      .catch(err => console.log(JSON.stringify(err)))
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label className="name">
          Name (String):
          <input type="text" name="name"
                 value={this.state.name}
                 onChange={this.handleChange}/>
        </label>
        <label>Latitude:
          <input type="number" name="latitude"
                 maxLength={32} value={this.state.latitude}
                 onChange={this.handleChange}/>
        </label>
        <label>Longitude:
          <input type="number" name="longitude"
                 maxLength={32} value={this.state.longitude}
                 onChange={this.handleChange}/>
        </label>
        <label>Cubic Feet Per Minute:
          <input type="number" step="0.0001" name="cubicFeetPerMinute"
                 maxLength={32}
                 value={this.state.cubicFeetPerMinute}
                 onChange={this.handleChange}/>
        </label>
        <div>Height
          <ImperialMeasurement
            value={this.state.height}
            onUpdate={this.updateChildProperty('height')}/>
        </div>
        <input type="submit" value="Submit"/>
        <input type="button" value="Reset" onClick={this.resetValues}/>
      </form>
    )
  }
}

export default PostNewWaterfall