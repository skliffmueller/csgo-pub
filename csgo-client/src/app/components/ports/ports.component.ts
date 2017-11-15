import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ports',
  templateUrl: './ports.component.html',
  styleUrls: [ './ports.component.scss' ],
  providers: [ ]
})
export class PortsComponent {

  @Output() envChange: EventEmitter;

  public input:Array<any> = [{
    key:"",
    value:""
  }];

  constructor() {
    this.envChange = new EventEmitter();
  }

  setValue(value) {
    if(value) {
      this.input = [];
      for(let key in value) {
        this.input.push({
          key:key,
          value:value[key][0].HostPort
        })
      }
    } else {
      this.input = [{
        key:"",
        value:""
      }]
      this.sendChange()
    }
  }
  changeKey(i, event) {
    this.input[i].key = event.target.value
    this.sendChange()
  }
  changeValue(i, event) {
    this.input[i].value = event.target.value
    this.sendChange()
  }

  addInput() {
    this.input.push({
      key:"",
      value:""
    })
    this.sendChange()
  }

  removeInput(i) {
    this.input.splice(1, 1)
    this.sendChange()
  }

  sendChange() {
    let out = {};
    this.input.forEach((i) => {
      out[i.key] = [{
        HostIp:"",
        HostPort:i.value
      }]
    })
    this.envChange.emit(out)
  }

}