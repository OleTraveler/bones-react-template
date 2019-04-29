import React from 'react'
import DateTimePicker from 'react-datetime-picker'
import './App.css'

class WaterfallCrudManager extends React.Component {

  static baseUrl = "http://localhost:8080/waterfall"

  constructor(props) {
    super(props)
    this.loadEntities = this.loadEntities.bind(this);
    this.updateChildProperty = this.updateChildProperty.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteEntity = this.deleteEntity.bind(this);
    this.resetValues = this.resetValues.bind(this);
    this.loadEntity = this.loadEntity.bind(this);
    this.state = {
      waterfalls: [],
      waterfall: WaterfallCrudManager.defaultState()
    }
    this.loadEntities()
  }

  resetValues() {
    this.setState({waterfall: WaterfallCrudManager.defaultState()})
  }

  loadEntities() {
    fetch(WaterfallCrudManager.baseUrl, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    }).then(function(response) {
      return response.json();
    }).then(resp => {
      this.setState({waterfalls: resp})
    }).catch(err => console.log(JSON.stringify(err)))
  }

  deleteEntity(id) {
    fetch(WaterfallCrudManager.baseUrl + "/" + id, {
      method: "DELETE", // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    }).then(response => {
      if (response.success) {
        this.loadEntities()
      } else {
        console.log(response);
      }
    })
  }

  loadEntity(id) {
    fetch(WaterfallCrudManager.baseUrl + "/" + id, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    }).then(response => { return response.json() })
    .then(response => {
        console.log(`loaded ${JSON.stringify(response)}`)
        const reactified = WaterfallCrudManager.addEmpty(response, WaterfallCrudManager.realTypes, WaterfallCrudManager.defaultState())
        reactified['id'] = id;
        console.log(`reactified ${JSON.stringify(reactified)}`)
        this.setState({waterfall: reactified})

    })
  }

  static clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = WaterfallCrudManager.clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = WaterfallCrudManager.clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }


  updateChildProperty(name) {
    return (key, value) => {
      const current = WaterfallCrudManager.clone(this.state[name]);
      current[key] = value;
      this.setState({[name]:current})
    }
  }

  handleSubmit(event) {
    event.preventDefault()

    console.log("Submit state:" + JSON.stringify(this.state.waterfall) + "TYPE" + this.state.waterfall.discoveryDate.toString());
    const prunedState = WaterfallCrudManager.removeEmpty(this.state.waterfall, WaterfallCrudManager.realTypes);
    console.log("Pruned state: " + JSON.stringify(prunedState));

    if (typeof this.state.waterfall.id  !== 'undefined') {
      fetch(WaterfallCrudManager.baseUrl + "/" + this.state.waterfall.id, {
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(prunedState)
      }).then(resp =>
        resp.json()
      ).then(response => {
        if (response.success === "false") {
          console.log("Failed: " + JSON.stringify(response));
        } else {
          this.setState({waterfall:WaterfallCrudManager.defaultState()})
          this.loadEntities();
        }
      }).catch(err => console.log(JSON.stringify(err)))
    } else {
      fetch(WaterfallCrudManager.baseUrl, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(prunedState)
      }).then(resp => resp.json())
        .then(response => {
        if (response.success === "false") {
          console.log("Failed: " + JSON.stringify(response));
        } else {
          this.setState({waterfall:WaterfallCrudManager.defaultState()})
          this.loadEntities();
        }
      }).catch(err => console.log(JSON.stringify(err)))
    }

  }

  render() {
    return (
      <div>
        <div className="ui container">
          { this.state.waterfallId !== null ?
            <div>Currently Editing {this.state.waterfallId}</div> :
            <div>Creating New Waterfall</div>}
          <form onSubmit={this.handleSubmit}>
            <WaterfallEdit waterfall={this.state.waterfall} onUpdate={this.updateChildProperty('waterfall')} />
            <input type="submit" value="Submit" className="ui primary button" />
            <input type="button" value="Reset" onClick={this.resetValues} className="ui button"/>
          </form>
        </div>
        <div className="ui container">
          <table className="ui celled table">
          <WaterfallHeader/>
          {this.state.waterfalls.map( (entity) => {
            return (
              <WaterfallDisplay key={entity.id} waterfall={entity} onDelete={this.deleteEntity} onEdit={this.loadEntity}></WaterfallDisplay>
            )
          })}
          </table>
        </div>
      </div>
    )
  }

  static waterVolumeOptions = ["Low", "Average", "high"];

  static realTypes = {
    name: 'string',
    latitude: 'float',
    longitude: 'float',
    cubicFeetPerMinute: 'float',
    height: {
      feet: 'integer',
      inches:'integer'
    },
    waterVolume: 'enumeration',
    discoveryDate: 'date',
    wantToVisit: 'boolean'

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
      },
      waterVolume:'Low',
      discoveryDate:new Date(),
      wantToVisit:false
    }
  };

  static addEmpty(obj, realTypes, defaults) {
    return Object.keys(realTypes)
      .reduce((newObj, typeName) => {
        const value = obj[typeName]
        if (typeof realTypes[typeName] === 'object') {
          const currentChild = value === null? {} : value;
          const children = WaterfallCrudManager.addEmpty(currentChild, realTypes[typeName], defaults[typeName])
          newObj[typeName] = children;
        } else if (realTypes[typeName] === 'boolean') {
          if (value === null || typeof value === 'undefined') {
            newObj[typeName] = defaults[typeName];
          } else {
            newObj[typeName] = value;
          }
        } else if (realTypes[typeName] === 'date') {
          if (value === null || typeof value === 'undefined') {
            newObj[typeName] = defaults[typeName];
          } else {
            newObj[typeName] = new Date(value.substring(value, value.length - 6));
          }
        } else {
          if (value === null || typeof value === 'undefined') {
            newObj[typeName] = defaults[typeName];
          } else {
            newObj[typeName] = value.toString();
          }
        }
        return newObj;
      },{})
  }

  static removeEmpty(obj, realTypes) {
    return Object.keys(obj)
      .filter(k => obj[k] !== null && obj[k] !== undefined && (typeof obj[k] !== 'string' || obj[k].trim().length > 0) && k !== 'id')  // Remove undef. and null.
      .reduce((newObj, k) => {
        if (obj[k] instanceof Date) {
          Object.assign(newObj, {[k]: obj[k].toISOString()})
        } else if (typeof obj[k] === 'object') {
          const reducedObj = WaterfallCrudManager.removeEmpty(obj[k], realTypes[k]) // Recurse.
          if (Object.keys(reducedObj).length !== 0) {
            Object.assign(newObj, {[k]: reducedObj})
          }
        } else {
          const newValue = WaterfallCrudManager.valueToRealType(obj[k],realTypes[k]);
          if (newValue !== null) {
            Object.assign(newObj, {[k]: newValue})  // Copy value.
          }
        }
        return newObj;
      }, {});
  }

  static valueToRealType(value, realType) {
    console.log("value: " + value)
    if (value.toString().trim().length === 0) {
      return null;
    } else if (realType === 'integer') {
      return parseInt(value);
    } else if (realType === 'float') {
      return parseFloat(value);
    } else if (realType === 'boolean') {
      return value;
    } else {
      return value.trim();
    }
  }

}

function WaterfallHeader(props) {

  return (
    <thead>
      <tr>
        <th></th>
        <th></th>
        <th>Name</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th>Cubic Feet Per Minute</th>
        <th>Height: Feet</th>
        <th>Height: Inches</th>
        <th>Water Volume</th>
        <th>Discovery Date</th>
        <th>Want To Visit</th>
      </tr>
    </thead>
  )
}

class WaterfallDisplay extends React.Component {

  render() {
    return (
      <tbody>
        <tr>
          <td><button onClick={() => this.props.onDelete(this.props.waterfall.id)} className="ui icon button">
            <i className="trash icon"></i></button></td>
          <td><button onClick={() => this.props.onEdit(this.props.waterfall.id)} className="ui icon button">
            <i className="edit icon"></i>
          </button></td>
          <td>{this.props.waterfall.name}</td>
          <td>{this.props.waterfall.latitude}</td>
          <td>{this.props.waterfall.longitude}</td>
          <td>{this.props.waterfall.cubicFeetPerMinute}</td>
          <td>{this.props.waterfall.height.feet}</td>
          <td>{this.props.waterfall.height.inches}</td>
          <td>{this.props.waterfall.waterVolume}</td>
          <td>{this.props.waterfall.discoveryDate}</td>
          <td>{this.props.waterfall.wantToVisit ? "true":"false"}</td>
        </tr>
      </tbody>
    )
  }
}


class WaterfallEdit extends React.Component {

  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this);
    this.updateChildProperty = this.updateChildProperty.bind(this);
    this.updateDate = this.updateDate.bind(this);
  }

  updateChildProperty(name) {
    return (key, value) => {
      const current = JSON.parse(JSON.stringify(this.props.waterfall[name]));
      current[key] = value;
      this.props.onUpdate(name, current)
    }
  }

  handleChange(event) {
    // console.log(event);
    // console.log(JSON.stringify(event))

    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.props.onUpdate(name, value)
  }

  updateDate(key, date) {
    console.log("update date. key" + key + " d:" + date);
    this.props.onUpdate(key, date);
  }

  render() {
    return (
      <div>
        <label className="name">
          Name (String):
          <input type="text" name="name" className="ui input"
                 value={this.props.waterfall.name}
                 onChange={this.handleChange}/>
        </label>
        <label>Latitude:
          <input type="number" name="latitude" className="ui input"
                 maxLength={32} value={this.props.waterfall.latitude}
                 onChange={this.handleChange}/>
        </label>
        <label>Longitude:
          <input type="number" name="longitude" className="ui input"
                 maxLength={32} value={this.props.waterfall.longitude}
                 onChange={this.handleChange}/>
        </label>
        <label>Cubic Feet Per Minute:
          <input type="number" step="0.0001" name="cubicFeetPerMinute" className="ui input"
                 maxLength={32}
                 value={this.props.waterfall.cubicFeetPerMinute}
                 onChange={this.handleChange}/>
        </label>
        <div>Height
          <ImperialMeasurementEdit
            imperialMeasurement={this.props.waterfall.height}
            onUpdate={this.updateChildProperty('height')}/>
        </div>
        <label>Water Volume
          <select name="waterVolume" value={this.props.waterfall.waterVolume} onChange={this.handleChange}>
            {
              WaterfallCrudManager.waterVolumeOptions.map( (o,i) => {
                return <option key={i} value={o}>{o}</option>
              })
            }
          </select>
        </label>
        <label>Discovery Date
          <DateTimePicker
            name="discoveryDatePicker"
            // onChange={this.updateDate}
            onChange={(date) => this.updateDate('discoveryDate', date)}
            value={this.props.waterfall.discoveryDate}
          />
        </label>
        <label>Want To Visit
          <input type="checkbox" name="wantToVisit" checked={this.props.waterfall.wantToVisit}
                    className="ui input" onChange={this.handleChange} />

        </label>
      </div>
    )
  }
}

class ImperialMeasurementEdit extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.props.onUpdate(name, value)
  }

  xrender() {
    return (
      <div>
        {JSON.stringify(this.props)}
      </div>
    )
  }
  render() {
    return (
      <div className="imperialMeasurement">
        <label>Feet:
          <input type="number" name="feet" maxLength={32} className="ui input"
                 value={this.props.imperialMeasurement.feet}
                 onChange={this.handleChange}/>
        </label>
        <label>Inches:
          <input type="number" name="inches" maxLength={32} className="ui input"
                 value={this.props.imperialMeasurement.inches}
                 onChange={this.handleChange}/>
        </label>
      </div>
    )
  }
}


export default WaterfallCrudManager
