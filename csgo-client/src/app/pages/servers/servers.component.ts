import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AppState } from '../../app.service';

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'servers',  // <home></home>
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  encapsulation: ViewEncapsulation.None,
  providers: [

  ],
  /**
   * Our list of styles in our component. We may add more to compose many styles together.
   */
  styleUrls: [ './servers.component.scss' ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './servers.component.html'
})
export class ServersComponent implements OnInit {
  /**
   * TypeScript public modifiers
   */
  constructor(
    public appState: AppState
  ) {

  }

  public ngOnInit() {
    console.log('hello `Servers` component');
    /**
     * this.title.getData().subscribe(data => this.data = data);
     */
  }
}
