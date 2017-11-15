import { Component, Directive, Provider, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MultiComponent } from './multi.component';


@Directive({
  selector: 'multi',
  host: {'(multiChange)': 'onChange($event)'},
  providers: [{provide:NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiValueAccessor), multi: true}]
})
export class MultiValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private host: MultiComponent) { }

  writeValue(value: any): void {
    this.host.setValue(value);
  }

  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}