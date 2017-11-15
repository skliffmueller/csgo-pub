import { Component, Directive, Provider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { EnvComponent } from './env.component';


@Directive({
  selector: 'env',
  host: {'(envChange)': 'onChange($event)'},
  providers: [{provide:NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EnvValueAccessor), multi: true}]
})
export class EnvValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private host: EnvComponent) { }

  writeValue(value: any): void {
    this.host.setValue(value);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}