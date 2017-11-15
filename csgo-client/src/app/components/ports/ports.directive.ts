import { Component, Directive, Provider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PortsComponent } from './ports.component';


@Directive({
  selector: 'ports',
  host: {'(portsChange)': 'onChange($event)'},
  providers: [{provide:NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PortsValueAccessor), multi: true}]
})
export class PortsValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private host: PortsComponent) { }

  writeValue(value: any): void {
    this.host.setValue(value);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}