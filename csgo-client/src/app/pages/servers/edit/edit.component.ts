import { Component, OnInit } from '@angular/core';

import { AppState } from '../../../app.service';

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'edit',  // <home></home>
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  providers: [

  ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './edit.component.html'
})
export class EditComponent implements OnInit {
  /**
   * TypeScript public modifiers
   */
  constructor(
    public appState: AppState
  ) {

  }

  public ngOnInit() {
    console.log('hello `Servers Edit` component');
    /**
     * this.title.getData().subscribe(data => this.data = data);
     */
  }
}
