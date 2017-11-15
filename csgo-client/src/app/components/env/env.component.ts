import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'env',
  templateUrl: './env.component.html',
  styleUrls: [ './env.component.scss' ],
  providers: [ ]
})
export class EnvComponent {

  @Output() envChange: EventEmitter;

  public input:Array<any> = [{
    key:"",
    value:""
  }];

  constructor() {
    this.envChange = new EventEmitter();
  }

  setValue(value) {
    if(value && value.length) {
      this.input = value.map((i) => {
        let a = i.split("=")
        let b = a.splice(0, 1);
        let c = a.join("=");
        return {
          key: b,
          value: c
        }
      })
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
    this.envChange.emit(this.input.map((i) => {
      return i.key+"="+i.value
    }))
  }

}