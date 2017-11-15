import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'multi',
  templateUrl: './multi.component.html',
  styleUrls: [ './multi.component.scss' ],
  providers: [ ]
})
export class MultiComponent {

  @Output() multiChange: EventEmitter;

  public input:Array<string> = [];

  constructor() {
    this.multiChange = new EventEmitter();
  }

  setValue(value) {
    if(value && value.length) {
      this.input = value;
    } else {
      this.input = [""]
      this.multiChange.emit(this.input)
    }
  }

  changeInput(i, event) {
    this.input[i] = event.target.value
    this.multiChange.emit(this.input)
  }

  addInput() {
    this.input.push("")
    this.multiChange.emit(this.input)
  }

  removeInput(i) {
    this.input.splice(1, 1)
    this.multiChange.emit(this.input)
  }

}